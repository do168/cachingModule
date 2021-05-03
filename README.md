# cachingModule

if same heavy traffic request come in server with cache-miss, how can control these requests with non-blocking?

## Subject

생각해보자. 어떤 요청[A]을 Cache DB에 담아두었다. 그런데 `Cache Replacement Algorithm`으로 인해 Cache DB에서 삭제된 상태이다.
이 때

1. 요청[A]가 들어왔고,
2. Cache DB를 조회한 결과 Miss가 발생하였다.
3. 그렇다면 이는 DB에 직접 접근하여 데이터를 가져올 것이며,
4. Cache에 Write를 한 후
5. 응답을 내린다.
   이러한 정상적인 Flow에, 한가지 특별한 상황을 가정해보자. `2 -> 3-> 4` 의 과정 중, 같은 요청[A]가 100번이 들어왔다!
   정상적인 요청과 그에 따라 정상적으로 응답을 보낼 시, 대략 `150 ~ 170 ms` 초가 걸린다. 즉 그 짧은 시간안에 같은 요청이 100번이 들어왔다는 것은 동시다발적으로 대용량 트래픽을 일으킬만큼 대규모 서비스일 것이다. 이 상황에서 문제점은 무엇이고 해결방법은 무엇일까?

## Problem

이러한 특별한 상황인 경우는 어떤 문제점이 있을까? 첫번째 요청이 DB를 조회한 후 다시 Cache에 Write하기 전 100번의 요청은 다시 각각 Cache DB를 조회한다. 그럼 모두 cache-miss 가 발생할 것이고 각각은 모두 DB를 조회하게 된다. 이 때, 이 서비스는 서버와 DB 사이에 MQ(Message Queue)가 없는 상태이다. 그럼 서버에서 설정한 `DBCP(Database Connection Pool)`의 `maxActive` 수만큼 커넥션을 얻어 DB를 조회하고 남은 대부분 요청들은 `DBCP`의 `maxWaitMillis`만큼 기다리게 된다. 그러나 이렇게 기다리는 것의 주체는 WAS에서 할당하는 `thread`이다. 정해진 `thread`가 모두 점유된 상태라면 더 이상 할당할 수 없어 서버는 요청을 받아들일 수 없고 `blocking`할 것이다. 이는 개발자 입장에서 좋지 않다. 더욱 억울한 것은 결국 `10초[maxWiatMills]` 동안의 대기 상태가 해제되고 커넥션을 획득해 사용자의 요청을 열심히 처리하고 응답을 보내도 그 응답을 받을 사용자는 이미 떠나고 난 뒤라는 점이다. 클릭 후 2~3초 내에 반응이 없으면 페이지를 새로 고치거나 다른 페이지로 이동하는 것이 보통인 인터넷 사용자의 행동을 생각하면 쉽게 이해된다. 결국은 기다리는 사람도 없는 요청에 응답하기 위해 자원을 낭비한 셈이 된다.

그럼 반대로 너무 작게 `maxWaitMillis` 어떤 문제가 발생할까? 상상대로다. 과부하 시 커넥션 풀에 여분의 커넥션이 없을 때마다 오류가 반환될 것이고 사용자는 너무 자주 오류 메시지를 볼 것이다. 어떠한 경우든 서비스의 품질이 낮아진다.
어떡하지?

## Approach

핵심은 DB 과부하를 없애면서 요청 또한 Blocking 없이 모두 받아들이는 것이다.
이를 위해 PUB/SUB을 이용하였다. 구체적인 로직은 다음과 같다.

1. 첫번째 요청이 Cache DB를 조회한다
2. cache-miss 발생 시 일단 cache-write를 하여 DB 조회 중임을 알 수 있는 코드를 value로 하여 저장한 후 DB를 조회한다.
3. 그 사이 들어온 요청들은 각각 Cache DB를 조회하고 해당 key가 존재한다
   3.1 해당 key의 value가 특정 코드라면 true data는 DB 조회 중임을 알고 해당 key를 topic으로 설정하여 subscripion한다. 그 후 문맥교환되어 다른 로직을 처리한다
4. DB를 조회하여 데이터를 받은 첫 번째 요청은 Cache DB의 해당 key의 data를 value로 저장한다
5. 첫 번째 요청은 data를 topic으로 하여 publish한다.
6. sub하고 있던 요청들은 pub을 event로 받아 그 안에 담겨있던 data를 리턴한다

## 기존 방식

1초에 100개의 요청이 들어온 상황을 테스트한 경우 9개의 요청이 DB로 있었다. 즉 첫번째 요청을 제외한 8개의 요청도 cost를 사용하여 커넥션을 맺고 DB와 연결한 것이다
| event\*time | user_host | thread_id | server_id | command_type | argument |
| ---------- | --------- | --------- | --------- | ------------ | -------- |
|2021-05-03T09:12:41.341722Z | [root] @ localhost [127.0.0.1] | 31 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.342162Z | [root] @ localhost [127.0.0.1] | 25 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.342321Z| [root] @ localhost [127.0.0.1] | 24 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.342482Z | [root] @ localhost [127.0.0.1] | 30 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.342876Z | [root] @ localhost [127.0.0.1] | 26 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.343084Z | [root] @ localhost [127.0.0.1] | 28 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.343224Z | [root] @ localhost [127.0.0.1] | 29 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.343390Z | [root] @ localhost [127.0.0.1] | 27 | 1 | Connect | root@localhost on mydb using TCP/IP |
|2021-05-03T09:12:41.341722Z | [root] @ localhost [127.0.0.1] | 31 | 1 | Connect | root@localhost on mydb using TCP/IP |
| 2021-05-03T09:12:41.354079Z | [root] @ localhost [127.0.0.1] | 29 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
| 2021-05-03T09:12:41.359890Z | [root] @ localhost [127.0.0.1] | 31 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.359927Z | [root] @ localhost [127.0.0.1] | 25 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.360008Z | [root] @ localhost [127.0.0.1] | 24 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.360135Z | [root] @ localhost [127.0.0.1] | 30 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.360194Z| [root] @ localhost [127.0.0.1] | 26 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.360288Z | [root] @ localhost [127.0.0.1] | 28 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
|2021-05-03T09:12:41.360448Z | [root] @ localhost [127.0.0.1] | 27 | 1 | Query | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |

## 개선 후

| event_time                  | user_host                      | thread_id | server_id | command_type | argument                                          |
| --------------------------- | ------------------------------ | --------- | --------- | ------------ | ------------------------------------------------- |
| 2021-05-02T06:20:36.124165Z | [root] @ localhost [127.0.0.1] | 22        | 1         | Connect      | root@localhost on mydb using TCP/IP               |
| 2021-05-02T06:20:36.131295Z | [root] @ localhost [127.0.0.1] | 22        | 1         | Query        | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
| 2021-05-02T06:20:36.124165Z | [root] @ localhost [127.0.0.1] | 23        | 1         | Connect      | root@localhost on mydb using TCP/IP               |
| 2021-05-02T06:20:36.131295Z | [root] @ localhost [127.0.0.1] | 23        | 1         | Query        | SELECT\n \_\n FROM\n Reservation\n WHERE\n id = 1 |
