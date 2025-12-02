// mail.js
function sendMail(to, subject, body) {
    console.log("=====================================")
    console.log("Simulated Email Notification")
    console.log("To:      ", to)
    console.log("Subject: ", subject)
    console.log("Body:\n", body)
    console.log("=====================================")
}

module.exports = { sendMail }
