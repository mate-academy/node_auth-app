
1. Create a PostgreSQL database.

2. Create a .env file in the backend folder.

  Specify the values ​​of the project environment variables.

  PORT=3005  
  CLIENT_HOST=https://localhost:5173  

  -database connection, as well as mail data:  
  -- DB_HOST=localhost  
  -- DB_USER=  
  -- DB_PASSWORD=  
  -- DB_DATABASE=  

  -- SMTP_PORT=  
  -- SMTP_HOST=  
  -- SMTP_USER=  
  -- SMTP_PASS=  

  -JWT keys:  
  -- JWT_KEY=  
  -- JWT_REFRESH_KEY=  

3. Create a .env file in the fromtend folder.

  -add:
  -- VITE_APP_API_URL=https://localhost:3005  
  -- ESLINT_NO_DEV_ERRORS=true  

4. In a separate terminal, navigate to the "frontend" directory from the repository root.  
    cd ./frontend
  
  -install the dependencies:  
    npm install  

5. In a separate terminal, navigate to the "beckend" directory from the repository root.  
    cd ./beckend  
  
  -install the dependencies:  
    npm install  

  -execute the command to quickly create tables in the database:  
    node ./setup.js  
  
6. To launch the frontend and backend simultaneously from the repository root:  
  npm run dev  

7. To run the frontend and backend separately from the repository root:  
  - npm run start:frontend  
  - npm run start:backend  