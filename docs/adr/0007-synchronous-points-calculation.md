# Synchronous points calculation

Points are calculated immediately in the same request when an Admin enters a Score, rather than via a background job or queue. The original spec described a "background job," but at the expected participant count (~200 people max) the calculation is simple arithmetic over at most 200 rows and completes in milliseconds. A queue (e.g. BullMQ + Redis) would add meaningful infrastructure overhead for a problem that does not exist at this scale. This decision should be revisited if the pool ever grows significantly.
