# Expense Splitter

A tool / web application to help split shared expenses fairly among a group of people.

## Table of Contents

- [About](#about)  
- [Features](#features)  
- [Demo / Live](#demo--live)  
- [Tech Stack](#tech-stack)  
- [Getting Started](#getting-started)  
  - [Prerequisites](#prerequisites)  
  - [Installation](#installation)  
  - [Running Locally](#running-locally)  
- [Usage](#usage)  
- [Project Structure](#project-structure)  
- [Contributing](#contributing)  
- [License](#license)  
- [Contact](#contact)  

---

## About

Expense Splitter is an application designed to simplify the management of shared expenses among friends, roommates, or groups. It helps you keep track of who paid what, split costs (equally or custom), and figure out reimbursements.

This repository contains both frontend and backend code.  

You can try out the live version here:  
[expense-splitter on Vercel](https://expense-splitter-dusky-iota.vercel.app) ([github.com](https://github.com/dhairya150805/Expense_Splitter))

---

## Features

- Add participants (users)
- Record expenses (description, amount, who paid)
- Select split method:
  - Equal split among participants
  - Custom split (by amount or percentage)
- View balance summary: how much each person owes or is owed
- Settlement suggestions: who should pay whom and how much
- Responsive UI — works on desktop & mobile

---

## Tech Stack

- **Frontend**: JavaScript, React (or your UI framework of choice), CSS / some styling library  
- **Backend**: Node.js / Express (if present), with REST API  
- **Database**: MongoDB (or SQLite / JSON file depending on config)  
- **Deployment**: Vercel (frontend) or server hosting  

---

## Getting Started

### Prerequisites

- Node.js (latest LTS recommended)  
- npm (comes with Node.js) or yarn  

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/dhairya150805/Expense_Splitter.git
