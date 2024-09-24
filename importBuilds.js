const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer'); // Импортируем Nodemailer
require('dotenv').config(); // Загружаем переменные из .env файла

// Настройка AWS S3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION,
})

// Путь к APK-файлу
const apkPath = path.join('/home/vitaliykorzenkoua/Dev/stplusAndroidAnalys/cordova/platforms/android/app/build/outputs/apk/debug/app-debug.apk');

// Получение текущей даты и времени
const currentDate = new Date();
const formattedDate = currentDate.toISOString().replace(/[:.]/g, '-'); // Форматируем дату и время
const filename = `app-debug-${formattedDate}.apk`; // Новое имя файла

// Настройки SMTP-сервера SendGrid
const transporter = nodemailer.createTransport({
    host: process.env.SENDGRID_HOST,
    port: process.env.SENDGRID_PORT,
    secure: false,
    auth: {
        user: process.env.SENDGRID_USER,
        pass: process.env.SENDGRID_PASS,
    },
});

// Массив получателей
const recipients = ['vitaliykorzenkoua@gmail.com', 'alex.simachov@analystsoft.com', 'alexeysim@gmail.com']; // Добавьте нужные адреса


const fromEmail = 'vitaliykorzhenkouapr@gmail.com';

// Чтение файла
fs.readFile(apkPath, (err, data) => {
    if (err) {
        console.error('Ошибка при чтении файла:', err);
        return;
    }

    // Параметры для загрузки файла в S3
    const params = {
        Bucket: 'statplusbuilds', // Замените на имя вашего бакета
        Key: filename, // Используем новое имя файла
        Body: data,
        ContentType: 'application/vnd.android.package-archive', // MIME-тип для APK
    };

    // Загрузка файла в S3
    s3.upload(params, (err, data) => {
        if (err) {
            console.error('Ошибка при загрузке файла в S3:', err);
            return;
        }
        
        console.log(`Файл загружен в S3: ${data.Location}`);
        
        // Создание ссылки на загруженный файл
        const fileUrl = `https://${params.Bucket}.s3.${s3.config.region}.amazonaws.com/${filename}`;

        // Настройки письма
        const mailOptions = {
            from: fromEmail, // Ваш отправитель
            to: recipients.join(', '),
            subject: `New Build StatPlus - ${currentDate.toLocaleString()}`,
            text: 
            `New build - ${currentDate.toLocaleString()}  
            StatPlus is ready. 
            Load: ${data.Location}`,
        };

        // Отправка письма
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log('Ошибка при отправке письма:', error);
            }
            console.log('Письмо отправлено:', info.response);
        });
    });
});
