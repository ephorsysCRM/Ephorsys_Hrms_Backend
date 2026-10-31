import sendEmail from "../../utils/sendEmail.js";

const sendEmployeeWelcomeEmailService = async ({
    employeeName,
    officialEmail,
    password,
}) => {
    await sendEmail({
        to: officialEmail,

        subject: "Welcome to HRMS - Your Employee Login Details",

        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8" />

                <style>
                    body {
                        margin: 0;
                        padding: 0;
                        background-color: #f5f7fa;
                        font-family: Arial, Helvetica, sans-serif;
                    }

                    .container {
                        max-width: 600px;
                        margin: 30px auto;
                        background: #ffffff;
                        border-radius: 10px;
                        overflow: hidden;
                        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
                    }

                    .header {
                        background: #104a17;
                        color: #ffffff;
                        padding: 25px;
                        text-align: center;
                    }

                    .header h1 {
                        margin: 0;
                        font-size: 24px;
                    }

                    .content {
                        padding: 30px;
                        color: #333333;
                        font-size: 15px;
                        line-height: 1.6;
                    }

                    .login-box {
                        margin: 25px 0;
                        padding: 20px;
                        background: #f7f9f8;
                        border: 1px solid #e1e5e2;
                        border-radius: 8px;
                    }

                    .login-row {
                        margin: 10px 0;
                    }

                    .label {
                        font-weight: bold;
                        color: #555555;
                    }

                    .value {
                        color: #111111;
                    }

                    .warning {
                        margin-top: 20px;
                        padding: 15px;
                        background: #fff8e1;
                        border-left: 4px solid #f0ad00;
                        border-radius: 4px;
                    }

                    .footer {
                        padding: 20px 30px;
                        background: #f5f7fa;
                        color: #777777;
                        font-size: 13px;
                    }
                </style>
            </head>

            <body>

                <div class="container">

                    <div class="header">
                        <h1>Welcome to HRMS</h1>
                    </div>

                    <div class="content">

                        <p>
                            Dear <strong>${employeeName}</strong>,
                        </p>

                        <p>
                            Welcome to our organization!
                        </p>

                        <p>
                            Your employee account has been successfully
                            created in the HRMS system.
                        </p>

                        <div class="login-box">

                            <h3>
                                Your Login Details
                            </h3>

                            <div class="login-row">
                                <span class="label">
                                    User ID:
                                </span>

                                <span class="value">
                                    ${officialEmail}
                                </span>
                            </div>

                            <div class="login-row">
                                <span class="label">
                                    Password:
                                </span>

                                <span class="value">
                                    ${password}
                                </span>
                            </div>

                        </div>

                        <p>
                            Please use the above credentials to log in
                            to the HRMS portal.
                        </p>

                        <div class="warning">

                            <strong>
                                Important Security Notice
                            </strong>

                            <p>
                                For security reasons, please change your
                                password after your first login.
                            </p>

                            <p>
                                Please do not share your login credentials
                                with anyone.
                            </p>

                        </div>

                        <p>
                            If you face any issue while logging in,
                            please contact the HR/Admin team.
                        </p>

                        <p>
                            Regards,<br />
                            <strong>HR/Admin Team</strong>
                        </p>

                    </div>

                    <div class="footer">

                        This is an automated email from the HRMS system.
                        Please do not reply directly to this email.

                    </div>

                </div>

            </body>
            </html>
        `,
    });
};

export default sendEmployeeWelcomeEmailService;