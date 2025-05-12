# SecretSpace

## Overview
What Finding a quiet place to study, work, or focus can be challenging, especially in urban areas where such spaces are not widely advertised. Many great spots exist inside buildings, libraries, or cafes, but they remain unknown
unless discovered by word of mouth. SecretSpace aims to solve
this problem by providing a platform where users can easily find and share quiet locations that are ideal for concentration.

## Feature list
1. Location discovery: Find quiet places near the user’s location.
2. Map integration: Display locations on an interactive map.
3. User-generated content: Users can share new locations and provide details.
4. Review & rating system: Users can leave comments and star ratings.
5. Suggestion with AI: User  can use AI for help finding motivating place

## Target User
- Age range: 15-40 years old.
- Gender: All genders.
- Regional focus: Everywhere
- Special interest groups: Students, remote workers, freelancers, and book lovers.

## Application Preview

## Requirement
1. NodeJs
2. Docker
3. Vscode or another IDE/Text editor
4. Xcode or Android studio emulator for (IOS/Android)

## Installation Guild
1. Clone the project
```bash
git clone https://github.com/Qosanglesz/SecretSpace.git
```
2. Go to backend server
```
cd ./secretspace-server/
```
3. Create '.env' file
```dotenv
# NestJS
PORT=8000
NODE_ENV=development
FRONTEND_ORIGIN=http://192.168.xxx.xxx:8081

# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_USER=myuser
POSTGRES_PASSWORD=mypassword
POSTGRES_DB=secretspacedb
POSTGRES_PORT=5432
POSTGRES_SYNCHRONIZE=true

# PGAdmin
PGADMIN_DEFAULT_EMAIL=admin@admin.com
PGADMIN_DEFAULT_PASSWORD=root
PGADMIN_PORT=5050

# JWT
JWT_SECRET=secret

# AI
DEEPSEEK_API_KEY=KEY
GOOGLE_MAPS_API_KEY=KEY
```
4. Run server
```bash
docker-compose up
npm run install
npm run start:dev
```
5. Go to expo application directory
```bash
cd ../secretspace-app
```
6. Create '.env'  in directory
```dotenv
EXPO_PUBLIC_API_URL=http://192.168.xxx.xxx:8000
```
7. Run expo application (SecretSpace)
```dotenv
npm install
npx expo install
npx expo start --clear
```
8. Open Mobile emulator such android studio emulator
```bash
a # it will link to your emulator
```