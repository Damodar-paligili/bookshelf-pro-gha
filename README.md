# Bookshelf Pro - Phase 1 (Cloud-Native CI/CD with GitHub Actions & AWS EKS)

An enterprise-grade, 3-tier web application (Bookshelf Pro) automated and deployed onto AWS using Terraform (IaC), GitHub Actions, Amazon EKS, Amazon RDS (MySQL), and Amazon ECR.

---

## Table of Contents
- Architecture Overview
- Project Directory Structure
- Prerequisites
- Step 1: GitHub Repository Setup
- Step 2: AWS IAM & GitHub Secrets Configuration
- Step 3: Provision Infrastructure with Terraform
- Step 4: Application Build & Deployment Pipeline
- Step 5: Database Migration & Verification
- Step 6: Live Application Testing
- Troubleshooting & Verification Commands
- Infrastructure Teardown

---

## Architecture Overview

* Frontend: React (Vite) single-page application served via Nginx.
* Backend: Node.js & Express RESTful API with JWT authentication and MySQL pooling.
* Database: Managed Amazon RDS MySQL instance (or containerized in-cluster MySQL pod).
* Compute Orchestration: Amazon EKS (Elastic Kubernetes Service) with managed EC2 Node Groups.
* Networking: Custom AWS VPC, Public & Private Subnets across Multi-AZs, Internet Gateway, and NAT Gateway.
* CI/CD Automation: GitHub Actions multi-pipeline for automated infrastructure lifecycle and zero-downtime microservice deployments.

---

## Project Directory Structure

bookshelf-pro-gha/
├── .github/
│   └── workflows/
│       ├── 01-terraform.yml            # Automated Terraform IaC Pipeline
│       └── 02-app-deploy.yml           # Build, Push (ECR) & Deploy (EKS) Pipeline
├── ROOT-terraform/                     # Modular Terraform Configuration
│   ├── envs/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── outputs.tf
│   └── modules/
│       ├── networking/                 # VPC, Subnets, IGW, NAT Gateway, Route Tables
│       ├── eks/                        # EKS Cluster, IAM Roles, Managed Node Groups
│       └── database/                   # RDS MySQL Instance & Security Groups
├── kubernetes-files/                   # Kubernetes Manifests
│   ├── configmap.yaml                  # Application ConfigMap (DB Host, Ports)
│   ├── secret.yaml                     # Application Secret (DB Credentials, JWT Secret)
│   ├── backend-deployment.yaml         # Backend Pod Deployment
│   ├── backend-service.yml             # Backend ClusterIP Service
│   ├── frontend-deployment.yml        # Frontend Deployment & LoadBalancer Service
│   └── sql-cm.yml                      # DB Init ConfigMap
├── backend/                            # Node.js API Service
│   ├── src/
│   │   ├── db/pool.js
│   │   ├── db/migrate_cover_only.js    # Schema Migration Script
│   │   ├── middleware/
│   │   └── routes/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── client/                             # React SPA
│   ├── src/
│   ├── public/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── index.html                      # Root Vite Entrypoint
│   └── package.json
├── docker-compose.yaml
└── README.md

---

## Prerequisites

Before starting, ensure you have:
1. An active AWS Account with administrative access.
2. AWS CLI installed and configured locally (`aws configure`).
3. kubectl installed for Kubernetes cluster management.
4. A GitHub Account to host the repository.

---

## Step 1: GitHub Repository Setup

1. Create a new GitHub repository named `bookshelf-pro-gha`.
2. Initialize Git and push the code:
   git init
   git branch -M main
   git add .
   git commit -m "feat: initial commit for phase 1 github actions"
   git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/bookshelf-pro-gha.git
   git push -u origin main

---

## Step 2: AWS IAM & GitHub Secrets Configuration

1. In your GitHub repository, navigate to Settings > Secrets and variables > Actions.
2. Click New repository secret and configure the following:

| Secret Name | Description | Example Value |
| :--- | :--- | :--- |
| AWS_ACCESS_KEY_ID | IAM User Access Key | AKIAIOSFODNN7EXAMPLE |
| AWS_SECRET_ACCESS_KEY | IAM User Secret Access Key | wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY |
| AWS_REGION | Target AWS Region | us-east-1 |
| EKS_CLUSTER_NAME | EKS Cluster Identifier | bookshelf-eks-cluster |

---

## Step 3: Provision Infrastructure with Terraform

1. Navigate to the Actions tab in your GitHub repository.
2. Select 01 - Terraform Infrastructure Pipeline on the left menu.
3. Click Run workflow > Select branch main > Choose action: apply > Click Run workflow.
4. The workflow will:
   * Dynamically create your unique S3 remote state bucket and DynamoDB lock table.
   * Provision the custom VPC, Subnets, NAT Gateway, EKS Cluster, Node Groups, and RDS MySQL instance.

---

## Step 4: Application Build & Deployment Pipeline

1. In the Actions tab, select 02 - Application CI/CD to EKS.
2. Click Run workflow > Click Run workflow.
3. The workflow will:
   * Ensure the Amazon ECR repositories (bookshelf-backend and bookshelf-frontend) exist.
   * Build both Docker container images.
   * Push the tagged images to Amazon ECR.
   * Connect to the newly created EKS cluster.
   * Apply all ConfigMaps, Secrets, Deployments, and Services.
   * Perform a zero-downtime rolling update.

---

## Step 5: Database Migration & Verification

1. Update your local kubeconfig to connect your local terminal to the EKS cluster:
   aws eks update-kubeconfig --region us-east-1 --name bookshelf-eks-cluster

2. Confirm the pods are running:
   kubectl get pods -l app=backend

3. Execute the database migration script inside an active backend pod:
   BACKEND_POD=$(kubectl get pods -l app=backend --field-selector=status.phase=Running -o jsonpath="{.items[0].metadata.name}")
   kubectl exec -it $BACKEND_POD -- node src/db/migrate_cover_only.js

   Expected output: Database tables verified/created successfully.

---

## Step 6: Live Application Testing

1. Retrieve the public DNS endpoint of the AWS Load Balancer:
   kubectl get svc frontend-service -o jsonpath="{.status.loadBalancer.ingress[0].hostname}"

2. Open the URL in your web browser.
3. Test end-to-end functionality:
   * Register: Create a new account at /register.
   * Login: Authenticate at /login.
   * Create Book: Add a new book title, author, description, and cover image.
   * Verify: Verify that the book is persisted in RDS and rendered on the home dashboard.

---

## Troubleshooting & Verification Commands

* Check Status of All Workloads:
  kubectl get all

* View Backend Application Logs:
  kubectl logs -l app=backend --tail=100 -f

* View Frontend Nginx Logs:
  kubectl logs -l app=frontend --tail=100 -f

* Verify Database Connectivity from Backend Pod:
  kubectl exec -it $(kubectl get pod -l app=backend --field-selector=status.phase=Running -o name | head -n 1) -- node -e "require('./src/db/pool').query('SELECT 1').then(() => console.log('DB Connection: SUCCESS')).catch(console.error)"

---

## Infrastructure Teardown

To tear down all AWS resources and avoid ongoing cloud costs:

1. Open the GitHub repository > Actions tab.
2. Select 01 - Terraform Infrastructure Pipeline.
3. Click Run workflow > Select action: destroy > Click Run workflow.
