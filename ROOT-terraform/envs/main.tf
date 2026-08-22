terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  backend "s3" {
    bucket         = "bookshelf-terraform-remote-state-prod" # REPLACE with your S3 bucket name
    key            = "state/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "bookshelf-tf-locks"                    # REPLACE with your DynamoDB table
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source               = "../modules/networking"
  vpc_cidr             = var.vpc_cidr
  public_subnet_cidrs  = var.public_subnet_cidrs
  private_subnet_cidrs = var.private_subnet_cidrs
  availability_zones   = var.availability_zones
  environment          = var.environment
}

module "eks" {
  source             = "../modules/eks"
  cluster_name       = var.cluster_name
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  node_instance_type = var.node_instance_type
  desired_capacity   = var.desired_capacity
  min_capacity       = var.min_capacity
  max_capacity       = var.max_capacity
}

module "database" {
  source             = "../modules/database"
  vpc_id             = module.networking.vpc_id
  private_subnet_ids = module.networking.private_subnet_ids
  db_name            = var.db_name
  db_username        = var.db_username
  db_password        = var.db_password
  environment        = var.environment
}
