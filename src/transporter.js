
import 'dotenv/config';
import { sendMail } from "./services/mail-service.js";

const info = await sendMail({ 
  to: 'ROBSZA, <gaserij360@datingso.com>',
   html: '<h1> HEY THIS IS TEST EMAIL!!!</h1>',
    subject:'Just testing'
   })

   console.log(info);
