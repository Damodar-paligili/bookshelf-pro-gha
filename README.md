# 📚 Bookshelf Pro — Phase 1: Cloud-Native CI/CD with GitHub Actions & AWS EKS

An enterprise-grade, 3-tier web application (**Bookshelf Pro**) automated and deployed onto AWS using **Terraform (IaC)**, **GitHub Actions**, **Amazon EKS**, **Amazon RDS (MySQL)**, and **Amazon ECR**.

---

## 📑 Table of Contents
1. [Architecture Overview](#-architecture-overview)
2. [Project Directory Structure](#-project-directory-structure)
3. [Prerequisites](#-prerequisites)
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

* **Frontend**: React (Vite) single-page application served via high-performance Nginx.
* **Backend**: Node.js & Express RESTful API with JWT authentication and MySQL connection pooling.
* **Database**: Managed Amazon RDS MySQL instance deployed in secure private subnets.
* **Container Registry**: Amazon ECR (Elastic Container Registry) hosting frontend and backend container images.
* **Container Orchestration**: Amazon EKS (Elastic Kubernetes Service) with managed EC2 worker node groups.
* **Networking**: Custom AWS VPC, Multi-AZ Public & Private Subnets, Internet Gateway, and NAT Gateway.
* **CI/CD Automation**: GitHub Actions multi-workflow pipelines for automated IaC lifecycle and zero-downtime rolling updates.

---

## 📂 Project Directory Structure

```text
bookshelf-pro-gha/
├── .github/
│   └── workflows/
│       ├── 01-terraform.yml            # Terraform IaC pipeline (S3 backend bootstrap + apply/destroy)
│       └── 02-app-deploy.yml           # App CI/CD pipeline (Docker build, ECR push, EKS rollout)
├── ROOT-terraform/                     # Modular Terraform Infrastructure Code
│   ├── envs/
│   │   ├── main.tf                     # Main orchestration file with S3 remote backend
│   │   ├── variables.tf                # Environment input variables
│   │   ├── terraform.tfvars            # Variable value definitions
│   │   └── outputs.tf                  # VPC, EKS, RDS, and ECR outputs
│   └── modules/
│       ├── networking/                 # VPC, Public/Private Subnets, IGW, NAT Gateway, Route Tables
│       ├── eks/                        # EKS Cluster, IAM Roles, Managed Node Groups
│       └── database/                   # Amazon RDS MySQL Instance & Security Groups
├── kubernetes-files/                   # Kubernetes Manifests
│   ├── configmap.yaml                  # Application ConfigMap (DB Host, Port, Name)
│   ├── secret.yaml                     # Application Secret (DB User/Pass, JWT Secret)
│   ├── backend-deployment.yaml         # Backend Pod Deployment
│   ├── backend-service.yml             # Backend ClusterIP Service
│   ├── frontend-deployment.yml        # Frontend Deployment & AWS LoadBalancer Service
│   └── sql-cm.yml                      # MySQL Initialization ConfigMap
├── backend/                            # Node.js Express REST API
│   ├── src/
│   │   ├── db/
│   │   │   ├── pool.js                 # MySQL connection pool
│   │   │   └── migrate_cover_only.js   # DB Table creation script
│   │   ├── middleware/
│   │   │   ├── auth.js                 # JWT verification middleware
│   │   │   └── errors.js               # Global error handler
│   │   └── routes/
│   │       ├── auth.js                 # Register & Login endpoints
│   │       └── books.js                # Books CRUD endpoints
│   ├── Dockerfile
│   ├── index.js                        # Express server entrypoint
│   └── package.json
├── client/                             # React (Vite) Frontend Application
│   ├── src/
│   │   ├── components/                 # UI components (Layout, Cards, Forms)
│   │   ├── context/                    # AuthContext for state management
│   │   ├── pages/                      # Views (Login, Register, Dashboard, Book Details)
│   │   ├── App.jsx                     # Router & Protected routes
│   │   ├── index.jsx                   # React DOM root
│   │   └── index.css                   # Global styles
│   ├── Dockerfile                      # Multi-stage build (Node build -> Nginx Alpine)
│   ├── nginx.conf                      # Nginx reverse proxy configuration
│   ├── index.html                      # Root HTML entrypoint for Vite
│   ├── vite.config.js                  # Vite configuration
│   └── package.json
├── docker-compose.yaml                 # Local multi-container test configuration
└── README.md
