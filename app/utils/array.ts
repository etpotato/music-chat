export function getRandomItem<T extends unknown>(arr: Array<T>) {
  return arr[Math.floor(Math.random() * arr.length)];
}
