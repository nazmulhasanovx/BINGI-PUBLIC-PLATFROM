/** A villa stands over the water when its view says so (Rooms › view: "Over water · lagoon"). */
export const overWater = (view?: string) => /water|lagoon|reef/i.test(view ?? "");
