# 📚 Bookshelf Pro — Phase 1: Cloud-Native CI/CD with GitHub Actions & AWS EKS

An enterprise-grade, 3-tier web application (**Bookshelf Pro**) automated and deployed onto AWS using **Terraform (IaC)**, **GitHub Actions**, **Amazon EKS**, **Amazon RDS (MySQL)**, and **Amazon ECR**.

---

## 📑 Table of Contents

1. [Architecture Overview](#-architecture-overview)
2. [Project Directory Structure](#-project-directory-structure)
3. [Prerequisites](#️-prerequisites)
4. [Step 1: GitHub Repository Setup](#step-1-github-repository-setup)
5. [Step 2: AWS IAM & GitHub Secrets Configuration](#step-2-aws-iam--github-secrets-configuration)
6. [Step 3: Provision Infrastructure with Terraform](#step-3-provision-infrastructure-with-terraform)
7. [Step 4: Application Build & Deployment Pipeline](#step-4-application-build--deployment-pipeline)
8. [Step 5: Database Schema Migration](#step-5-database-schema-migration)
9. [Step 6: How to Access & Verify the Application](#step-6-how-to-access--verify-the-application)
10. [Useful Diagnostic & Troubleshooting Commands](#-useful-diagnostic--troubleshooting-commands)
11. [Infrastructure Teardown (Clean-Up)](#-infrastructure-teardown-clean-up)

---

## 🏛 Architecture Overview

- **Frontend**: React (Vite) single-page application served via high-performance Nginx.
- **Backend**: Node.js & Express RESTful API with JWT authentication and MySQL connection pooling.
- **Database**: Managed Amazon RDS MySQL instance deployed in secure private subnets.
- **Container Registry**: Amazon ECR (Elastic Container Registry) hosting frontend and backend container images.
- **Container Orchestration**: Amazon EKS (Elastic Kubernetes Service) with managed EC2 worker node groups.
- **Networking**: Custom AWS VPC, Multi-AZ public & private subnets, Internet Gateway, and NAT Gateway.
- **CI/CD Automation**: GitHub Actions multi-workflow pipelines for automated IaC lifecycle and zero-downtime rolling updates.

---

## 📂 Project Directory Structure

```text
bookshelf-pro-gha/
├── .github/
│   └── workflows/
│       ├── 01-terraform.yml            # Terraform IaC pipeline (S3 backend bootstrap + apply/destroy)
│       └── 02-app-deploy.yml           # App CI/CD pipeline (Docker build, ECR push, EKS rollout)
├── ROOT-terraform/                     # Modular Terraform infrastructure code
│   ├── envs/
│   │   ├── main.tf                     # Main orchestration file with S3 remote backend
│   │   ├── variables.tf                # Environment input variables
│   │   ├── terraform.tfvars            # Variable value definitions
│   │   └── outputs.tf                  # VPC, EKS, RDS, and ECR outputs
│   └── modules/
│       ├── networking/                 # VPC, public/private subnets, IGW, NAT Gateway, route tables
│       ├── eks/                        # EKS cluster, IAM roles, managed node groups
│       └── database/                   # Amazon RDS MySQL instance & security groups
├── kubernetes-files/                   # Kubernetes manifests
│   ├── configmap.yaml                  # Application ConfigMap (DB host, port, name)
│   ├── secret.yaml                     # Application Secret (DB user/pass, JWT secret)
│   ├── backend-deployment.yaml         # Backend pod deployment
│   ├── backend-service.yml             # Backend ClusterIP service
│   ├── frontend-deployment.yml         # Frontend deployment & AWS LoadBalancer service
│   └── sql-cm.yml                      # MySQL initialization ConfigMap
├── backend/                            # Node.js Express REST API
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js                 # MySQL connection pool
│   │   │   └── migrate_cover_only.js   # DB table creation script
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification middleware
│   │   │   └── errors.js               # Global error handler
│   │   └── routes/
│   │       ├── auth.js                 # Register & login endpoints
│   │       └── books.js                # Books CRUD endpoints
│   ├── Dockerfile
│   ├── index.js                        # Express server entrypoint
│   └── package.json
├── client/                             # React (Vite) frontend application
│   ├── src/
│   │   ├── components/                 # UI components (layout, cards, forms)
│   │   ├── context/                    # AuthContext for state management
│   │   ├── pages/                      # Views (login, register, dashboard, book details)
│   │   ├── App.jsx                     # Router & protected routes
│   │   ├── index.jsx                   # React DOM root
│   │   └── index.css                   # Global styles
│   ├── Dockerfile                      # Multi-stage build (Node build -> Nginx Alpine)
│   ├── nginx.conf                      # Nginx reverse proxy configuration
│   ├── index.html                      # Root HTML entrypoint for Vite
│   ├── vite.config.js                  # Vite configuration
│   └── package.json
├── docker-compose.yaml                 # Local multi-container test configuration
└── README.md
```

---

## ⚙️ Prerequisites

Before running the deployment pipelines, verify you have the following ready:

- An active AWS account with administrative privileges.
- AWS CLI installed and configured locally (`aws configure`).
- `kubectl` installed for cluster verification.
- A GitHub account hosting the repository.

---

## Step 1: GitHub Repository Setup

1. Create a new GitHub repository named `bookshelf-pro-gha`.
2. Initialize and push your project to GitHub:

```bash
cd bookshelf-pro-gha
git init
git branch -M main
git add .
git commit -m "feat: initial commit for phase 1 cloud-native deployment"
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/bookshelf-pro-gha.git
git push -u origin main
```

---

## Step 2: AWS IAM & GitHub Secrets Configuration

In your GitHub repository, open **Settings > Secrets and variables > Actions**.

Click **New repository secret** and add the following four secrets:

| Secret Name | Description | Example Value |
|---|---|---|
| `AWS_ACCESS_KEY_ID` | AWS IAM user access key | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM user secret key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `AWS_REGION` | Target AWS region | `us-east-1` |
| `EKS_CLUSTER_NAME` | Name of the EKS cluster | `bookshelf-eks-cluster` |

---

## Step 3: Provision Infrastructure with Terraform

1. Go to the **Actions** tab in your GitHub repository.
2. Under **All workflows**, select **01 - Terraform Infrastructure Pipeline**.
3. Click **Run workflow** > select branch `main` > choose action `apply` > click **Run workflow**.

**What this workflow automates:**

- Automatically provisions a globally unique S3 bucket and DynamoDB table for remote state and locking.
- Provisions a custom VPC, multi-AZ public/private subnets, Internet Gateway, and NAT Gateway.
- Deploys the Amazon EKS cluster with managed EC2 worker nodes.
- Deploys the Amazon RDS MySQL database instance.
- Creates the Amazon ECR repositories (`bookshelf-backend` and `bookshelf-frontend`).

---

## Step 4: Application Build & Deployment Pipeline

1. Once the Terraform pipeline completes, select **02 - Application CI/CD to EKS** from the Actions tab.
2. Click **Run workflow** > select branch `main` > click **Run workflow**.

**What this workflow automates:**

- Builds production-ready Docker container images for both backend and frontend.
- Pushes tagged images to Amazon ECR.
- Authenticates against the EKS cluster.
- Deploys the Kubernetes ConfigMaps, Secrets, Deployments, and Services.
- Executes rolling zero-downtime pod updates.

---

## Step 5: Database Schema Migration

Once pods are running, initialize the database tables from your local terminal.

1. Update your local kubeconfig:

```bash
aws eks update-kubeconfig --region us-east-1 --name bookshelf-eks-cluster
```

2. Confirm backend pods are in `Running` state:

```bash
kubectl get pods -l app=backend
```

3. Execute the migration script inside an active backend pod:

```bash
BACKEND_POD=$(kubectl get pods -l app=backend --field-selector=status.phase=Running -o jsonpath="{.items[0].metadata.name}")

kubectl exec -it $BACKEND_POD -- node src/db/migrate_cover_only.js
```

**Expected output:**

```text
Running database migrations...
Database tables verified/created successfully.
```

---

## Step 6: How to Access & Verify the Application

### 1. Retrieve the public Load Balancer endpoint

```bash
kubectl get svc frontend-service
```

Look under the `EXTERNAL-IP` column to find your AWS Load Balancer DNS name (e.g., `a1b2c3d4e5...us-east-1.elb.amazonaws.com`).

Alternatively, extract only the hostname directly:

```bash
kubectl get svc frontend-service -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"
```

### 2. Access the application in your browser

Copy the hostname and paste it into your browser using `http://`:

```text
http://<YOUR-LOADBALANCER-HOSTNAME>
```

> **Note:** AWS Load Balancers typically take 1–2 minutes to finish DNS propagation and initial health checks on first launch.

### 3. Verify end-to-end application features

- **User Registration** — Navigate to `/register` and create a new user account.
- **Authentication** — Sign in at `/login` to receive a secure JWT session token.
- **Add a Book** — Click **Add Book**, enter a title, author, description, and cover image URL, and submit.
- **Dashboard Verification** — Check that your book appears on the dashboard and persists after page refreshes.
- **Edit & Delete** — Update book details and delete records to confirm full database CRUD operation.

---

## 🔍 Useful Diagnostic & Troubleshooting Commands

**Inspect all cluster resources:**

```bash
kubectl get all -o wide
```

**View backend API logs in real time:**

```bash
kubectl logs -l app=backend --tail=100 -f
```

**View frontend Nginx web server logs:**

```bash
kubectl logs -l app=frontend --tail=100 -f
```

**Test database connectivity from inside the cluster:**

```bash
kubectl exec -it $(kubectl get pod -l app=backend --field-selector=status.phase=Running -o name | head -n 1) -- node -e "require('./src/db/pool').query('SELECT 1').then(() => console.log('Database Connection: SUCCESS')).catch(console.error)"
```

**Restart deployments:**

```bash
kubectl rollout restart deployment/backend-deployment
kubectl rollout restart deployment/frontend-deployment
```

---

## 🧹 Infrastructure Teardown (Clean-Up)

To completely destroy all provisioned AWS cloud resources and prevent ongoing billing:

1. Open your GitHub repository > **Actions** tab.
2. Select **01 - Terraform Infrastructure Pipeline**.
3. Click **Run workflow** > select action `destroy` > click **Run workflow**.
4. Wait for the pipeline to finish destroying the EKS cluster, EC2 instances, RDS database, NAT Gateways, VPC, and ECR repositories.
