@echo off
echo Creating Virtual Classroom folder structure...
cd /d D:\virtual-classroom

REM Create server subfolders
cd server
mkdir config models controllers routes middleware utils uploads 2>nul

REM Create config files
echo // Database connection > config\db.js

REM Create model files
echo // User model > models\User.js
echo // Class model > models\Class.js
echo // Assignment model > models\Assignment.js
echo // Submission model > models\Submission.js
echo // Discussion model > models\Discussion.js

REM Create controller files
echo // Auth controller > controllers\authController.js
echo // User controller > controllers\userController.js
echo // Class controller > controllers\classController.js
echo // Assignment controller > controllers\assignmentController.js
echo // Submission controller > controllers\submissionController.js
echo // Discussion controller > controllers\discussionController.js

REM Create route files
echo // Auth routes > routes\authRoutes.js
echo // User routes > routes\userRoutes.js
echo // Class routes > routes\classRoutes.js
echo // Assignment routes > routes\assignmentRoutes.js
echo // Submission routes > routes\submissionRoutes.js
echo // Discussion routes > routes\discussionRoutes.js

REM Create middleware files
echo // Auth middleware > middleware\authMiddleware.js
echo // Role middleware > middleware\roleMiddleware.js
echo // Upload middleware > middleware\uploadMiddleware.js
echo // Error middleware > middleware\errorMiddleware.js

REM Create util files
echo // Generate token > utils\generateToken.js
echo // Send email > utils\sendEmail.js
echo // Validators > utils\validators.js

REM Create server.js
echo // Main server file > server.js

REM Create .env file
echo PORT=5000 > .env
echo MONGODB_URI=mongodb://localhost:27017/virtual-classroom >> .env
echo JWT_SECRET=your_super_secret_key_change_this >> .env

REM Create .gitignore
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo uploads/ >> .gitignore

cd ..

REM Create client subfolders
cd client\src
mkdir assets\images assets\styles 2>nul
mkdir components\layout components\common components\classes components\assignments components\discussions 2>nul
mkdir pages context services hooks utils 2>nul

REM Create component files
echo // Header > components\layout\Header.js
echo // Footer > components\layout\Footer.js
echo // Sidebar > components\layout\Sidebar.js
echo // Layout > components\layout\Layout.js

echo // Button > components\common\Button.js
echo // Input > components\common\Input.js
echo // Modal > components\common\Modal.js
echo // Spinner > components\common\Spinner.js
echo // Alert > components\common\Alert.js
echo // Card > components\common\Card.js

echo // ClassCard > components\classes\ClassCard.js
echo // ClassList > components\classes\ClassList.js
echo // ClassForm > components\classes\ClassForm.js

echo // AssignmentCard > components\assignments\AssignmentCard.js
echo // AssignmentList > components\assignments\AssignmentList.js
echo // AssignmentForm > components\assignments\AssignmentForm.js
echo // SubmissionForm > components\assignments\SubmissionForm.js

echo // DiscussionThread > components\discussions\DiscussionThread.js
echo // Comment > components\discussions\Comment.js
echo // DiscussionForm > components\discussions\DiscussionForm.js

REM Create page files
echo // Home > pages\Home.js
echo // Login > pages\Login.js
echo // Register > pages\Register.js
echo // Dashboard > pages\Dashboard.js
echo // Classes > pages\Classes.js
echo // ClassDetail > pages\ClassDetail.js
echo // Assignments > pages\Assignments.js
echo // AssignmentDetail > pages\AssignmentDetail.js
echo // Submissions > pages\Submissions.js
echo // Discussions > pages\Discussions.js
echo // Profile > pages\Profile.js
echo // NotFound > pages\NotFound.js

REM Create context files
echo // AuthContext > context\AuthContext.js
echo // ClassContext > context\ClassContext.js
echo // AssignmentContext > context\AssignmentContext.js

REM Create service files
echo // API setup > services\api.js
echo // Auth service > services\authService.js
echo // Class service > services\classService.js
echo // Assignment service > services\assignmentService.js
echo // Discussion service > services\discussionService.js

REM Create hook files
echo // useAuth > hooks\useAuth.js
echo // useForm > hooks\useForm.js

REM Create util files
echo // Constants > utils\constants.js
echo // Helpers > utils\helpers.js

cd ..\..

REM Create root files
echo node_modules/ > .gitignore
echo .env >> .gitignore
echo dist/ >> .gitignore
echo build/ >> .gitignore

echo # Virtual Classroom > README.md
echo. >> README.md
echo A full-stack MERN application for online learning >> README.md

echo.
echo ========================================
echo Folder structure created successfully!
echo ========================================
echo.
echo Now install dependencies:
echo 1. For root: npm install
echo 2. For server: cd server ^&^& npm install express mongoose dotenv cors bcryptjs jsonwebtoken express-validator multer nodemailer socket.io
echo 3. For client: cd client ^&^& npm install axios react-router-dom react-hot-toast react-icons date-fns @mui/material @emotion/react @emotion/styled
echo.
pause