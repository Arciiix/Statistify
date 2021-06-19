import express from "express";

const PORT: number | string = process.env.PORT || 8497;
import constants from "./secret";

const app = express();

function log(message: string, isError?: boolean): void {
  let nowDate: Date = new Date();

  //Format the date into HH:mm:ss dd.MM.yyyy
  let nowString = `${addZero(nowDate.getHours())}:${addZero(
    nowDate.getMinutes()
  )}:${addZero(nowDate.getSeconds())} ${addZero(nowDate.getDate())}.${addZero(
    nowDate.getMonth() + 1
  )}.${nowDate.getFullYear()}`;

  console.log(`[${isError ? "ERROR" : "LOG"}] [${nowString}] ${message}`);
}

function addZero(value: number): string {
  return value < 10 ? `0${value}` : `${value}`;
}

app.listen(PORT, (): void => {
  log(`App has started on the port ${PORT}`);
});
