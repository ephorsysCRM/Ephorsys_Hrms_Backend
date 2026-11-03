const sendEmail = async ({ to, subject, html }) => {
    const apiKey = process.env.BREVO_API_KEY;
    const senderEmail = process.env.BREVO_SENDER_EMAIL;
    const senderName = process.env.BREVO_SENDER_NAME || "HRMS";

    if (!apiKey) throw new Error("BREVO_API_KEY is not set");
    if (!senderEmail) throw new Error("BREVO_SENDER_EMAIL is not set");

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            accept: "application/json",
            "content-type": "application/json",
            "api-key": apiKey,
        },
        body: JSON.stringify({
            sender: { name: senderName, email: senderEmail },
            to: [{ email: to }],
            subject,
            htmlContent: html,
        }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        console.error("EMAIL ERROR:", response.status, data);
        throw new Error(data.message || "Failed to send email");
    }

    console.log("Email sent successfully:", data.messageId);
    return data;
};

export default sendEmail;