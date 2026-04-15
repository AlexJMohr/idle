# Proxmox
variable "proxmox_host" {
  description = "Proxmox host IP or hostname (no port)"
  type        = string
}

variable "proxmox_node" {
  description = "Proxmox node name"
  type        = string
  default     = "pve"
}

variable "proxmox_api_token" {
  description = "Proxmox API token — format: user@realm!tokenid=uuid"
  type        = string
  sensitive   = true
}

# Container
variable "ubuntu_template_file_id" {
  description = "LXC template file ID, e.g. local:vztmpl/ubuntu-24.04-standard_24.04-2_amd64.tar.zst"
  type        = string
}

variable "container_cores" {
  type    = number
  default = 2
}

variable "container_memory" {
  description = "RAM in MB"
  type        = number
  default     = 1024
}

variable "container_disk_size" {
  description = "Disk size in GB"
  type        = number
  default     = 10
}

variable "ssh_public_key_path" {
  description = "Path to SSH public key file to authorize in the container"
  type        = string
  default     = "~/.ssh/id_ed25519.pub"
}

variable "proxmox_ssh_user" {
  description = "SSH user on the Proxmox host for running pct exec"
  type        = string
  default     = "root"
}

# Docker / GHCR
variable "ghcr_user" {
  description = "GitHub username for GHCR login"
  type        = string
}

variable "ghcr_token" {
  description = "GitHub PAT with read:packages scope for GHCR login"
  type        = string
  sensitive   = true
}

variable "docker_image" {
  description = "Full Docker image ref, e.g. ghcr.io/amohr/idlegame:latest"
  type        = string
}

# Cloudflare
variable "cloudflare_api_token" {
  description = "Cloudflare API token with Tunnel:Edit and DNS:Edit permissions"
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for amohr.net"
  type        = string
}
