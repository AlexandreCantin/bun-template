import nodemailer from "nodemailer";
import nodemailerCramMd5 from "nodemailer-cram-md5";
import { ISendMail } from "../domain/interfaces";

export class MailAdapter implements ISendMail {
  private transporter: any;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      ignoreTLS: process.env.ENV !== "production",
      auth: {
        type: "custom",
        method: "CRAM-MD5",
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      customAuth: {
        "CRAM-MD5": nodemailerCramMd5,
      },
    });
  }

  async sendMail({
    to,
    subject,
    html,
  }: {
    to: string[];
    subject: string;
    html: string;
  }) {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: to.join(","),
      subject,
      html,
    });
  }
}
