import { GATEWAY_BASE_URL } from './config';

export async function checkGatewayHealth(): Promise<string> {
  const res = await fetch(`${GATEWAY_BASE_URL}/api/healthz`);

  if (!res.ok) {
    throw new Error('Gateway health check failed');
  }

  return res.text();
}

export async function checkGatewayReadiness(): Promise<string> {
  const res = await fetch(`${GATEWAY_BASE_URL}/api/readyz`);

  if (!res.ok) {
    throw new Error('Gateway readiness check failed');
  }

  return res.text();
}
