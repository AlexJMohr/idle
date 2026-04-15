# idlegame

An idle clicker game inspired by Cookie Clicker, written in Svelte.

## Developing

Install dependencies and start a development server:

```sh
npm install
npm run dev
```

## Building

```sh
npm run build
npm run preview  # preview production build
```

## Deployment

The app is packaged as a Docker image and deployed to a Proxmox LXC container, exposed via a Cloudflare Tunnel.

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- Proxmox VE with an Ubuntu 24.04 LXC template downloaded:
  ```sh
  pveam download local ubuntu-24.04-standard_24.04-2_amd64.tar.zst
  ```
- Proxmox API token with `PVEAdmin` role (or at minimum: `VM.Allocate`, `VM.Config.*`, `Datastore.AllocateSpace`, `Sys.Modify`)
- SSH access from your machine to the Proxmox host as the API token user
- Cloudflare API token with **Account > Cloudflare Tunnel > Edit** and **Zone > DNS > Edit** permissions
- GitHub PAT with `read:packages` scope

### Setup

```sh
cd terraform
cp terraform.tfvars.example terraform.tfvars
# fill in terraform.tfvars
terraform init
terraform apply
```

`terraform apply` will:

1. Create an Ubuntu 24.04 LXC container on Proxmox (DHCP)
2. Create a Cloudflare Tunnel and `idlegame.amohr.net` DNS record
3. SSH to the Proxmox host and run the setup script inside the container via `pct exec`, which:
   - Installs Docker
   - Logs in to GHCR and pulls the image
   - Registers the container as a systemd service
   - Installs and starts `cloudflared` with the tunnel token
