import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // =========================
  // DELETE EVERYTHING
  // =========================

  await prisma.ball.deleteMany();
  await prisma.playerMatchStat.deleteMany();
  await prisma.inningStat.deleteMany();
  await prisma.match.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.teamStat.deleteMany();
  await prisma.playerStat.deleteMany();
  await prisma.team.deleteMany();
  await prisma.player_profile.deleteMany();
  await prisma.user.deleteMany();

  console.log("Database cleaned.");

  // =========================
  // USERS
  // =========================

  const user1 = await prisma.user.create({
    data: {
      name: "Virat Kohli",
      email: "virat@test.com",
      password: "123456",
    },
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Rohit Sharma",
      email: "rohit@test.com",
      password: "123456",
    },
  });

  console.log("Users created.");

  // =========================
  // PLAYER PROFILES
  // =========================

  const player1 = await prisma.player_profile.create({
    data: {
      user_id: user1.user_id,
      player_name: "Virat Kohli",
      player_role: "Batter",
      batting_style: "Right Hand Bat",
      rating: 95,
    },
  });

  const player2 = await prisma.player_profile.create({
    data: {
      user_id: user2.user_id,
      player_name: "Rohit Sharma",
      player_role: "Batter",
      batting_style: "Right Hand Bat",
      rating: 92,
    },
  });

  const guestPlayer = await prisma.player_profile.create({
    data: {
      player_name: "Guest Player",
      player_role: "Bowler",
      rating: 70,
    },
  });

  console.log("Players created.");

  // =========================
  // TEAMS
  // =========================

  const team1 = await prisma.team.create({
    data: {
      team_name: "Royal Challengers",
    },
  });

  const team2 = await prisma.team.create({
    data: {
      team_name: "Mumbai Indians",
    },
  });

  console.log("Teams created.");

  // =========================
  // TEAM MEMBERS
  // =========================

  await prisma.teamMember.create({
    data: {
      team_id: team1.team_id,
      player_id: player1.player_id,
      role_team: "Captain",
    },
  });

  await prisma.teamMember.create({
    data: {
      team_id: team2.team_id,
      player_id: player2.player_id,
      role_team: "Captain",
    },
  });

  await prisma.teamMember.create({
    data: {
      team_id: team2.team_id,
      player_id: guestPlayer.player_id,
      role_team: "Member",
    },
  });

  console.log("Team members created.");

  // =========================
  // MATCH
  // =========================

  const match = await prisma.match.create({
    data: {
      team1_id: team1.team_id,
      team2_id: team2.team_id,
      match_format: "T20",
      overs: 20,
      status: "LIVE",
      scheduled_time: new Date(),
      toss_winner: team1.team_id,
      toss_decision: "BAT",
    },
  });

  console.log("Match created.");

  // =========================
  // INNINGS
  // =========================

  const innings1 = await prisma.inningStat.create({
    data: {
      match_id: match.match_id,
      batting_team_id: team1.team_id,
      bowling_team_id: team2.team_id,
    },
  });

  console.log("Innings created.");

  // =========================
  // BALL
  // =========================

  const ball1 = await prisma.ball.create({
    data: {
      match_id: match.match_id,
      innings_id: innings1.innings_id,

      over_no: 0,
      ball_no: 1,

      striker_id: player1.player_id,
      non_striker_id: player1.player_id,
      bowler_id: guestPlayer.player_id,

      batsmen_runs: 4,

      is_wicket: false,
    },
  });

  console.log("Ball created.");

  // =========================
  // PLAYER MATCH STATS
  // =========================

  await prisma.playerMatchStat.create({
    data: {
      match_id: match.match_id,
      player_id: player1.player_id,
      team_id: team1.team_id,

      runs: 4,
      balls_faced: 1,
      fours: 1,
    },
  });

  console.log("Player match stats created.");

  // =========================
  // PLAYER CAREER STATS
  // =========================

  await prisma.playerStat.create({
    data: {
      player_id: player1.player_id,
      matches: 1,
      innings: 1,
      runs: 4,
      balls_faced: 1,
      highest_score: 4,
    },
  });

  console.log("Player stats created.");

  // =========================
  // TEAM CAREER STATS
  // =========================

  await prisma.teamStat.create({
    data: {
      team_id: team1.team_id,
      matches: 1,
      runs_scored: 4,
      balls_faced: 1,
    },
  });

  console.log("Team stats created.");

  // =========================
  // TEST QUERIES
  // =========================

  const fetchedMatch = await prisma.match.findUnique({
    where: {
      match_id: match.match_id,
    },
    include: {
      team1: true,
      team2: true,
      innings: true,
      balls: true,
    },
  });

  console.dir(fetchedMatch, { depth: null });

  console.log("Everything works.");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });