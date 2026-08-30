export const aggregatePostMatchStats = async (tx: any, match: any, innings: any[]) => {
  const playerStats = await tx.playerMatchStat.findMany({ where: { match_id: match.match_id } });

  for (const pms of playerStats) {
    const battedThisMatch = pms.balls_faced > 0 || pms.runs > 0;
    const existing = await tx.playerStat.findUnique({ where: { player_id: pms.player_id } });
    const newHighest = Math.max(existing?.highest_score ?? 0, battedThisMatch ? pms.runs : 0);

    await tx.playerStat.upsert({
      where: { player_id: pms.player_id },
      create: {
        player_id: pms.player_id,
        matches: 1,
        innings: battedThisMatch ? 1 : 0,
        runs: pms.runs, balls_faced: pms.balls_faced, fours: pms.fours, sixes: pms.sixes,
        highest_score: battedThisMatch ? pms.runs : 0,
        wickets: pms.wickets, balls_bowled: pms.balls_bowled, runs_conceded: pms.runs_conceded, maidens: 0,
        catches: pms.catches, stumpings: pms.stumpings, run_outs: pms.run_outs,
      },
      update: {
        matches: { increment: 1 },
        innings: { increment: battedThisMatch ? 1 : 0 },
        runs: { increment: pms.runs },
        balls_faced: { increment: pms.balls_faced },
        fours: { increment: pms.fours },
        sixes: { increment: pms.sixes },
        highest_score: newHighest,
        wickets: { increment: pms.wickets },
        balls_bowled: { increment: pms.balls_bowled },
        runs_conceded: { increment: pms.runs_conceded },
        catches: { increment: pms.catches },
        stumpings: { increment: pms.stumpings },
        run_outs: { increment: pms.run_outs },
      },
    });
  }

  if (match.match_type === "PRACTICE") return;

  for (const teamId of [match.team1_id, match.team2_id]) {
    const battingInnings = innings.filter((i) => i.batting_team_id === teamId);
    const bowlingInnings = innings.filter((i) => i.bowling_team_id === teamId);

    const runs_scored = battingInnings.reduce((sum, i) => sum + i.total_runs, 0);
    const balls_faced = battingInnings.reduce((sum, i) => sum + i.total_balls, 0);
    const wickets_lost = battingInnings.reduce((sum, i) => sum + i.total_wickets, 0);
    const runs_conceded = bowlingInnings.reduce((sum, i) => sum + i.total_runs, 0);
    const balls_bowled = bowlingInnings.reduce((sum, i) => sum + i.total_balls, 0);
    const wickets_taken = bowlingInnings.reduce((sum, i) => sum + i.total_wickets, 0);

    const teamPlayerStats = await tx.playerMatchStat.findMany({ where: { match_id: match.match_id, team_id: teamId } });
    const catches = teamPlayerStats.reduce((sum: number, s: any) => sum + s.catches, 0);
    const stumpings = teamPlayerStats.reduce((sum: number, s: any) => sum + s.stumpings, 0);
    const run_outs = teamPlayerStats.reduce((sum: number, s: any) => sum + s.run_outs, 0);

    const win = match.winner === teamId;
    const loss = match.result_type !== "TIE" && match.result_type !== "NO_RESULT" && match.winner !== null && match.winner !== teamId;
    const tie = match.result_type === "TIE";
    const noResult = match.result_type === "NO_RESULT";

    await tx.teamStat.upsert({
      where: { team_id: teamId },
      create: {
        team_id: teamId, matches: 1,
        wins: win ? 1 : 0, losses: loss ? 1 : 0, ties: tie ? 1 : 0, no_results: noResult ? 1 : 0,
        runs_scored, balls_faced, wickets_lost, runs_conceded, balls_bowled, wickets_taken,
        catches, stumpings, run_outs,
      },
      update: {
        matches: { increment: 1 },
        wins: { increment: win ? 1 : 0 },
        losses: { increment: loss ? 1 : 0 },
        ties: { increment: tie ? 1 : 0 },
        no_results: { increment: noResult ? 1 : 0 },
        runs_scored: { increment: runs_scored },
        balls_faced: { increment: balls_faced },
        wickets_lost: { increment: wickets_lost },
        runs_conceded: { increment: runs_conceded },
        balls_bowled: { increment: balls_bowled },
        wickets_taken: { increment: wickets_taken },
        catches: { increment: catches },
        stumpings: { increment: stumpings },
        run_outs: { increment: run_outs },
      },
    });
  }
};