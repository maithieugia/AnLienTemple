type PlayerPosition = { x: number; y: number; z: number };

/** Stop at the first body contact, even when a running step would cross the body. */
export function stopAtPlayer(
  from: PlayerPosition, nextX: number, nextZ: number, other: PlayerPosition,
): [number, number] {
  if (Math.abs(from.y - other.y) >= 1.6) return [nextX, nextZ];

  const separation = .64;
  const offsetX = from.x - other.x;
  const offsetZ = from.z - other.z;
  const dx = nextX - from.x;
  const dz = nextZ - from.z;
  const travelSquared = dx * dx + dz * dz;
  const toward = offsetX * dx + offsetZ * dz;
  if (toward >= 0 || travelSquared === 0) return [nextX, nextZ];

  const gapSquared = offsetX * offsetX + offsetZ * offsetZ - separation * separation;
  // Players can share a spawn point. Allow them to move apart without pulling either back.
  if (gapSquared <= 0) return [from.x, from.z];
  const discriminant = toward * toward - travelSquared * gapSquared;
  if (discriminant <= 0) return [nextX, nextZ];

  const contact = (-toward - Math.sqrt(discriminant)) / travelSquared;
  if (contact >= 1) return [nextX, nextZ];
  return [from.x + dx * contact, from.z + dz * contact];
}
