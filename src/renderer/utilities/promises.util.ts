export const asyncTimeout = async (miliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, miliseconds));
}