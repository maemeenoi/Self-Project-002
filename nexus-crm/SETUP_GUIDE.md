# NexusCRM Setup Guide

This guide will walk you through the commands to initialize the **Frontend** and **Backend** projects according to the architectural design.

---

## 1. Prerequisites

Ensure you have the following installed:
*   **Node.js** (v18 or newer)
*   **Python** (v3.10 or newer)
*   **Git**

---

## 2. Frontend Initialization (Next.js)

We will use `create-next-app` to set up the frontend with React, TypeScript, and Tailwind CSS.

1.  **Navigate to the project root:**
    ```bash
    cd nexus-crm
    ```

2.  **Initialize the Next.js app:**
    *   **Note:** We run this *inside* the `frontend` folder. Since the folder already exists, we use `.` (current directory) after entering it.

    ```bash
    # Go into the frontend folder
    cd frontend

    # Run the creator (it might ask to install create-next-app first, say yes)
    npx create-next-app@latest .
    ```

3.  **Select the following options when prompted:**
    *   **TypeScript:** `Yes`
    *   **ESLint:** `Yes`
    *   **Tailwind CSS:** `Yes`
    *   **`src/` directory:** `Yes` (Keeps things clean)
    *   **App Router:** `Yes` (This is the modern Next.js standard)
    *   **Customize the default import alias (@/*)?** `No` (or Yes if you prefer)

4.  **Install additional dependencies:**
    We need `shadcn/ui` (for professional components) and `tanstack-query` (for data fetching).
    ```bash
    # Install Shadcn UI CLI
    npx shadcn-ui@latest init
    # (Follow the prompts: Style=Default, Base Color=Slate, CSS variables=Yes)

    # Install React Query and Axios
    npm install @tanstack/react-query axios lucide-react
    ```

5.  **Test it:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see your app.

---

## 3. Backend Initialization (Python/FastAPI)

We will set up a virtual environment and install the core dependencies.

1.  **Navigate to the backend folder:**
    ```bash
    # From nexus-crm root
    cd ../backend
    ```

2.  **Create a Virtual Environment:**
    This keeps your dependencies isolated.
    ```bash
    # macOS/Linux
    python3 -m venv venv
    source venv/bin/activate

    # Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install Dependencies:**
    We need FastAPI, an ASGI server (Uvicorn), and database tools.
    ```bash
    pip install fastapi uvicorn[standard] pydantic sqlalchemy asyncpg python-dotenv openai
    ```

4.  **Create the initial file structure:**
    Since `fastapi-cli` is new, we'll do the standard manual setup for full control.

    Create a file named `main.py`:
    ```python
    # nexus-crm/backend/main.py
    from fastapi import FastAPI

    app = FastAPI(title="NexusCRM API")

    @app.get("/")
    async def read_root():
        return {"message": "Welcome to NexusCRM API"}
    ```

5.  **Test it:**
    ```bash
    uvicorn main:app --reload
    ```
    Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) to see the automatic Swagger UI.

---

## 4. Next Steps

Once you have both servers running:
1.  Read `PROJECT_DESIGN.md` to review the database schema.
2.  Start with **Phase 1**: Create a `Lead` model in the backend and fetch it from the frontend.
