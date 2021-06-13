import express from "express";

const PORT: number | string = process.env.PORT || 8497;
import constants from "./secret";

const app = express();

app.listen(PORT, (): void => {
  //DEV
  //TODO: Log
  console.log(`App has started on the port ${PORT}`);
});
