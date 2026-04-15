resource "random_id" "tunnel_secret" {
  byte_length = 35
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "idlegame" {
  account_id = var.cloudflare_account_id
  name       = "idlegame"
  secret     = random_id.tunnel_secret.b64_std
}

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "idlegame" {
  account_id = var.cloudflare_account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.idlegame.id

  config {
    ingress_rule {
      hostname = "idlegame.amohr.net"
      service  = "http://localhost:3000"
    }
    # catch-all required by Cloudflare
    ingress_rule {
      service = "http_status:404"
    }
  }
}

resource "cloudflare_record" "idlegame" {
  zone_id = var.cloudflare_zone_id
  name    = "idlegame"
  content = "${cloudflare_zero_trust_tunnel_cloudflared.idlegame.id}.cfargotunnel.com"
  type    = "CNAME"
  proxied = true
}
