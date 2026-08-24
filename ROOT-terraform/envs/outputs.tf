output "vpc_id" {
  value = module.networking.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.database.db_endpoint
}

output "ecr_backend_repo_url" {
  value       = aws_ecr_repository.backend.repository_url
  description = "ECR URL for backend container image"
}

output "ecr_frontend_repo_url" {
  value       = aws_ecr_repository.frontend.repository_url
  description = "ECR URL for frontend container image"
}
