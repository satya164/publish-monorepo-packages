declare module 'pacote' {
  export function extract(
    name: string,
    destination: string,
    options?: {}
  ): Promise<{ from: string; resolved: string; registry: string }>;
}
