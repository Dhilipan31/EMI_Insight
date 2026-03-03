# 📌 EMI Insigth Application

A full-stack Loan & EMI Management System built using **React (Frontend)** and **Spring Boot (Backend)**.

This application allows users to manage loans, track EMI payments, and receive automated email reminders for upcoming payments.

* * *

## 🚀 Features

### 👤 User Features

-   User Registration & Login
    
-   Create and manage multiple loans
    
-   Track EMI details
    
-   View upcoming payment dates
    
-   View payment history
    

### 💰 Loan Features

-   Add new loan with EMI details
    
-   Store next payment date
    
-   Calculate EMI schedule
    
-   Update loan status
    

### 🔔 EMI Reminder System (InProgress)

-   Automated daily scheduler
    
-   Sends email reminder before due date
    
-   Prevents missed payments
    
-   Designed for scalability
    

* * *

## 🏗️ Tech Stack

### Frontend

-   React
    
-   Axios
    
-   Tailwind / CSS
    
-   React Hooks
    

### Backend

-   Spring Boot
    
-   Spring Data JPA
    
-   Hibernate
    
-   MySQL
    
-   Brevo
    
-   Spring Scheduler (`@Scheduled`)
    

### Database

-   MySQL
    

* * *

## 🧠 Architecture Overview

Frontend (React)  
⬇  
REST API (Spring Boot)  
⬇  
Service Layer  
⬇  
JPA Repository  
⬇  
MySQL Database

EMI Reminder Flow:

1.  Scheduler runs daily
    
2.  Fetch loans with upcoming `nextPaymentDate`
    
3.  Trigger email notification to user
    

* * *

## 📂 Project Structure

### Backend

src/main/java  
 ├── controller  
 ├── service  
 ├── repository  
 ├── entity   
 └── config

### Frontend

src/  
 ├── components  
 ├── pages  
 ├── hooks  
 ├── services  
 └── utils

* * *

## ⚙️ Installation & Setup

### 🔹 Backend Setup

1.  Clone the repository
    

git clone [<your-repo-url>](https://github.com/Dhilipan31/EMI_Insight

2.  Configure `application.properties`
    

spring.datasource.url=jdbc:mysql://localhost:3306/emi\_tracker  
spring.datasource.username=your\_username  
spring.datasource.password=your\_password  
  
spring.mail.host=smtp.gmail.com  
spring.mail.port=587  
spring.mail.username=your-email  
spring.mail.password=your-app-password

3.  Run the application
    

mvn spring-boot:run

Backend runs on:

http://localhost:8080

* * *

### 🔹 Frontend Setup

1.  Navigate to frontend folder
    

cd frontend

2.  Install dependencies
    

npm install

3.  Start the application
    

npm run dev

Frontend runs on:

http://localhost:5173

* * *

## 📬 EMI Reminder Scheduler

-   Runs daily at configured time
    
-   Uses Spring’s `@Scheduled` annotation
    
-   Queries loans due in upcoming days
    
-   Sends email notification to user
    

Designed in a way that it can be extended to:

-   Kafka-based event-driven reminder system
    
-   SMS / WhatsApp notifications
    
-   Cloud scheduler integration
    

* * *

## 📊 Future Improvements

-   Refresh token implementation
    
-   Role-based access control
    
-   Kafka-based notification system
    
-   Docker deployment
    
-   Kubernetes support
    
-   AWS deployment
    

* * *

## 🧪 Testing

-   Unit testing with JUnit
    
-   Integration testing for API endpoints
    
-   Manual frontend testing
    

* * *

## 🎯 Learning Outcomes

This project demonstrates:

-   Full-stack development
    
-   REST API design
    
-   Background job scheduling
    
-   Email integration
    
-   Clean layered architecture
    
-   Real-world fintech use case implementation
    

* * *

## 🏆 Why This Project?

This project simulates a real-world EMI management system used in fintech platforms.  
It focuses on automation, scalability, and maintainable architecture.

* * *

## 👨‍💻 Author

Dhilipan  
Full Stack Developer  
React | Spring Boot | System Design Enthusiast

---

## 📄 License

This project is licensed under the MIT License – see the LICENSE file for details.
You are free to use, modify, and distribute this software for personal and commercial purposes.
