// Date 형식인지 체크
export const checkCorrectDateFormat = (format: string): void => {
  const datetimeRegexp = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]/;
  if (!datetimeRegexp.test(format)) {
    throw new Error();
  }
};
