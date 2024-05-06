const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

const { Pool } = require('pg');
const { couldStartTrivia } = require('typescript');

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ferma',
    password: '123',
    port: 5432,
    client_encoding: 'win866',
});

pool.connect((err) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err);
    } else {
        console.log('Connected to PostgreSQL');
    }
});

app.get('/', (req, res) => {
    res.send('Answer_to_client');
});

app.get('/api/entry/:i', (req, res) => {
    const i = req.params.i;
    let str = "";
    if (i === '0') {
        str = `SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM Дата) IN (12, 1, 2) THEN 'Зима' 
            WHEN EXTRACT(MONTH FROM Дата) IN (3, 4, 5) THEN 'Весна' 
            WHEN EXTRACT(MONTH FROM Дата) IN (6, 7, 8) THEN 'Лето'
            WHEN EXTRACT(MONTH FROM Дата) IN (9, 10, 11) THEN 'Осень' 
        END AS Время_года, 
        STRING_AGG(CAST(Секция_Идентификатор AS TEXT), ',' ORDER BY Секция_Идентификатор) AS Секция_идентификатор,
        SUM(Сумма) AS Объем_затрат
    FROM
        Затраты
    GROUP BY
        Время_года;`;

    } else if (i === '1') {
        str = `SELECT
        Секция_Идентификатор,
        SUM(Сумма) AS Объем_затрат,
        STRING_AGG(CONCAT(Описание, ' (', Сумма, ')'), ', ') AS Описание_Затрат_и_Сумма
    FROM
        Затраты
    GROUP BY
        Секция_Идентификатор
    ORDER BY
    Секция_Идентификатор ASC;`;
    }
    else if (i == '2') {
        str = `SELECT * FROM Затраты
        ORDER BY Идентификатор ASC;
        `;
    }
    else if (i == '3') {
        str = `SELECT 
        CASE 
            WHEN EXTRACT(MONTH FROM Дата) IN (12, 1, 2) THEN 'Зима' 
            WHEN EXTRACT(MONTH FROM Дата) IN (3, 4, 5) THEN 'Весна' 
            WHEN EXTRACT(MONTH FROM Дата) IN (6, 7, 8) THEN 'Лето'
            WHEN EXTRACT(MONTH FROM Дата) IN (9, 10, 11) THEN 'Осень' 
        END AS Время_года,
        SUM(Сумма) AS Сумма,
        STRING_AGG(CAST(Животное_Идентификатор AS VARCHAR), ',') AS Живность_ID
    FROM
        Выручка
    GROUP BY
        Время_года;
    `;
    }
    else if (i == '4') {
        str = `SELECT
        DATE(Дата) AS Дата,
        Животное.Порода,
        SUM(Сумма) AS Объем_выручки
    FROM
        Выручка
    JOIN
        Животное ON Выручка.Животное_Идентификатор = Животное.Идентификатор
    GROUP BY
        Дата, Животное.Порода
    ORDER BY
        Животное.Порода ASC;
    `;
    }
    else if (i == '5') {
        str = `SELECT * FROM Выручка
        order by Идентификатор asc;`;
    }
    else if (i == '6') {
        str = `WITH ЗатратыПоВременамГода AS (
            SELECT 
                CASE 
                    WHEN EXTRACT(MONTH FROM Дата) IN (12, 1, 2) THEN 'Зима' 
                    WHEN EXTRACT(MONTH FROM Дата) IN (3, 4, 5) THEN 'Весна' 
                    WHEN EXTRACT(MONTH FROM Дата) IN (6, 7, 8) THEN 'Лето'
                    WHEN EXTRACT(MONTH FROM Дата) IN (9, 10, 11) THEN 'Осень' 
                END AS Время_года, 
                SUM(Сумма) AS Объем_затрат
            FROM
                Затраты
            GROUP BY
                Время_года
        ),
        ВыручкаПоВременамГода AS (
            SELECT 
                CASE 
                    WHEN EXTRACT(MONTH FROM Дата) IN (12, 1, 2) THEN 'Зима' 
                    WHEN EXTRACT(MONTH FROM Дата) IN (3, 4, 5) THEN 'Весна' 
                    WHEN EXTRACT(MONTH FROM Дата) IN (6, 7, 8) THEN 'Лето'
                    WHEN EXTRACT(MONTH FROM Дата) IN (9, 10, 11) THEN 'Осень' 
                END AS Время_года,
                SUM(Сумма) AS Сумма
            FROM
                Выручка
            GROUP BY
                Время_года
        )
        SELECT 
            z.Время_года,
            COALESCE(v.Сумма, 0) - z.Объем_затрат AS Прибыль
        FROM 
            ЗатратыПоВременамГода z
        LEFT JOIN
            ВыручкаПоВременамГода v ON z.Время_года = v.Время_года;
        `;
    }
    else if (i == '7') {
        str = `SELECT STRING_AGG(Идентификатор::TEXT, ',' ORDER BY Идентификатор) AS Секция FROM Секция;
        `;
    }
    else if (i == '8') {
        str = `WITH 
        TotalSalary AS (
            SELECT SUM(D.Оклад) AS X
            FROM Сотрудники S
            JOIN Должность D ON S.Должность = D.Название
        ),
        TotalExpenses AS (
            SELECT SUM(Сумма) AS Z
            FROM Затраты
        )
    SELECT
        X AS "X",
        ROUND((X / Z) * 100) AS "Y",
        Z AS "Z"
    FROM
        TotalSalary, TotalExpenses;
    `;
    }
    else if (i == '9') {
        str = `SELECT S.*, D.Оклад
        FROM Сотрудники S
        INNER JOIN Должность D ON S.Должность = D.Название;
        `;
    }
    else if (i == '10') {
        str = `SELECT
        (SELECT STRING_AGG("Порода" || '(ID: ' || "Идентификатор" || ')', ', ') AS "Здоровые"
         FROM "Молодняк"
         WHERE "Здоровье" = 'Здоров') AS "Здоров",
        (SELECT STRING_AGG("Порода" || '(ID: ' || "Идентификатор" || ')', ', ') AS "Больные"
         FROM "Молодняк"
         WHERE "Здоровье" = 'Болен') AS "Болен",
        (SELECT STRING_AGG("Порода" || '(ID: ' || "Идентификатор" || ')', ', ') AS "Критическое состояние"
         FROM "Молодняк"
         WHERE "Здоровье" = 'Критическое') AS "Критическое состояние";`;
    }
    else if (i == '11') {
        str = `SELECT
        "Идентификатор",
        "Дата рождения",
        "Порода",
        EXTRACT(YEAR FROM AGE("Дата рождения")) AS "Лет",
        EXTRACT(MONTH FROM AGE("Дата рождения")) AS "Месяцев"
    FROM
        Молодняк
    ORDER BY
        "Лет",
        "Месяцев";
    
    `;
    }
    else if (i == '12') {
        str = `SELECT * FROM Молодняк`;
    }
    pool.query(
        str,
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else {
                res.json(result.rows);
            }
        }
    );
});

app.put('/api/entry/:id', (req, res) => {
    const id = parseFloat(req.params.id);
    const { info, time } = req.body;
    const price = parseFloat(req.body.price);
    const section = parseFloat(req.body.section);
    const animal = req.body.animal;
    let fourth = 0;
    let str = ``;
    if (animal == '') {
        fourth = section;
        str = `UPDATE Затраты SET Описание = $1, Дата = $2, Сумма = $3, Секция_Идентификатор = $4 WHERE Идентификатор = $5 RETURNING *`;
    }
    else {
        fourth = animal;
        str = `UPDATE Выручка SET Описание = $1, Дата = $2, Сумма = $3, Животное_Идентификатор = $4 WHERE Идентификатор = $5 RETURNING *`;
    }
    pool.query(
        str,
        [info, time, price, fourth, id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.put('/api/employe/:id', (req, res) => {
    const id = (req.params.id);
    const { info } = req.body;
    let [firstName, lastName, third] = info.split(' ');
    lastName += ` ${third}`;
    const section = (req.body.section);
    const sex = req.body.sex;
    const number = (req.body.number);
    const job = req.body.job;
    const money = (req.body.money);
    str = `UPDATE Сотрудники SET Фамилия = $1, "Имя, отчество" = $2, Секция = $3, Пол = $4, "Номер телефона" = $5, Должность = $6 WHERE Идентификатор = $7 RETURNING *`;
    pool.query(
        str,
        [firstName, lastName, section, sex, number, job, id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.put('/api/breed/:id', (req, res) => {
    const id = (req.params.id);
    const { info } = req.body;
    const section = (req.body.section);
    const sex = req.body.sex;
    const number = (req.body.number);
    const job = req.body.job;
    str = `UPDATE Молодняк SET "Идентификатор_Родитель" = $1, "Дата рождения" = $2, Пол = $3, Порода = $4, Здоровье = $5 WHERE Идентификатор = $6 RETURNING *`;
    pool.query(
        str,
        [info, number, sex, section, job, id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});


app.post('/api/entry', (req, res) => {
    const { info, time } = req.body;
    const price = parseFloat(req.body.price);
    const section = parseFloat(req.body.section);
    const animal = req.body.animal;
    console.log(req.body);
    let fourth = 0;
    let str = ``;
    console.log(req.body)
    if (animal == '') {
        fourth = section;
        str = `INSERT INTO Затраты (Описание, Дата, Сумма, Секция_Идентификатор) VALUES ($1, $2, $3, $4) RETURNING *`;
    }
    else {
        fourth = animal;
        str = `INSERT INTO Выручка (Описание, Дата, Сумма, Животное_Идентификатор) VALUES ($1, $2, $3, $4) RETURNING *`;
    }
    pool.query(
        str,
        [info, time, price, fourth],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.post('/api/employe', (req, res) => {
    const { info } = req.body;
    let [firstName, lastName, third] = info.split(' ');
    lastName += ` ${third}`;
    const section = (req.body.section);
    const sex = req.body.sex;
    const number = (req.body.number);
    const job = req.body.job;
    str = `INSERT INTO Сотрудники (Фамилия, "Имя, отчество", Секция, Пол, "Номер телефона", Должность) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    pool.query(
        str,
        [firstName, lastName, section, sex, number, job],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.post('/api/breed', (req, res) => {
    const id = (req.params.id);
    const { info } = req.body;
    const section = (req.body.section);
    const sex = req.body.sex;
    const number = (req.body.number);
    const job = req.body.job;
    str = `INSERT INTO Молодняк ("Идентификатор_Родитель", "Дата рождения", "Пол", "Порода", "Здоровье")
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
    `;
    pool.query(
        str,
        [info, number, sex, section, job],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.delete('/api/entry/:id', (req, res) => {
    const { id } = req.params;
    let str = ``;
    if (req.body["Секция_Идентификатор"]) {
        str = `DELETE FROM Затраты WHERE Идентификатор = $1 RETURNING *`;
    }
    else {
        str = `DELETE FROM Выручка WHERE Идентификатор = $1 RETURNING *`;
    }
    pool.query(
        str,
        [id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.delete('/api/employe/:id', (req, res) => {
    const { id } = req.params;
    pool.query(
        `DELETE FROM Сотрудники WHERE Идентификатор = $1 RETURNING *`,
        [id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});

app.delete('/api/breed/:id', (req, res) => {
    const { id } = req.params;
    pool.query(
        `DELETE FROM Молодняк WHERE Идентификатор = $1 RETURNING *`,
        [id],
        (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                res.status(500).json({ error: 'Internal Server Error' });
            } else if (result.rows.length === 0) {
                res.status(404).json({ error: 'Item not found' });
            } else {
                res.json(result.rows[0]);
            }
        }
    );
});