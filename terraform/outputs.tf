output "url" {
  value = "https://idlegame.amohr.net"
}

output "tunnel_id" {
  value = cloudflare_zero_trust_tunnel_cloudflared.idlegame.id
}
