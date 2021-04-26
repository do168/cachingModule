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
이러한 특별한 상황인 경우는 어떤 문제점이 있을까? 첫번째 요청이 DB를 조회한 후 다시 Cache에 Write하기 전 100번의 요청은 다시 각각 Cache DB를 조회한다. 그럼 모두 cache-miss 가 발생할 것이고 각각은 모두 DB를 조회하게 된다. 이 때, 이 서비스는 서버와 DB 사이에 MQ(Message Queue)가 없는 상태이다. 그럼 서버에서 설정한 DBCP(Database Connection Pool)의 MaxActive 수만큼 커넥션을 얻어 DB를 조회하고 남은 대부분 요청들은 루프를 돌며 기다리게 될 것이고 이는 곧 i/o-bound thread를 무기한 점유하는 그림이 된다. 정해진 thread가 모두 점유된 상태라면 더 이상 서버는 요청을 받아들일 수 없고 blocking할 것이다. 이는 개발자 입장에서 좋지 않다. 어떠한 이유에서든 요청 자체가 막힌다면 사용자는 불편을 느낀다. 어떡하지? 
