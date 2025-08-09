import { metersToMiles, metersToFeet, round2Decimals } from "./formatters";
import { requireStravaClient } from "./strava-client";

export async function getActivityById(id: number) {
  const client = await requireStravaClient()
  const act = await client.activities.getActivityById({id})

  return {
    strava_activity_id: act.id,
    date: act.start_date,
    date_local: act.start_date_local,
    distance_mi: round2Decimals(metersToMiles(act.distance)),
    moving_time_s: act.moving_time,
    elapsed_time_s: act.elapsed_time,
    avg_pace_s_per_mi: Math.round(act.moving_time / metersToMiles(act.distance)),
    avg_hr: Math.round(act.average_heartrate),
    cadence_spm: round2Decimals(act.average_cadence),
    max_hr: act.max_heartrate,
    elev_gain_ft: round2Decimals(metersToFeet(act.total_elevation_gain)),
    route_start_latlng: act.start_latlng,
    splits: act.splits_standard.map((split) => ({
      split: split.split,
      distance_mi: round2Decimals(metersToMiles(split.distance)),
      moving_time_s: split.moving_time,
      pace_s: split.moving_time / metersToMiles(split.distance),
      avg_hr: Math.round(split.average_heartrate),
      elev_gain_ft: round2Decimals(metersToFeet(split.elevation_difference)),
    })),
    rpe: act.perceived_exertion,
    shoes: act.gear?.name,
    notes: act.description,
  }
}