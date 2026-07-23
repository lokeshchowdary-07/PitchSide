# **Pitchside**





* ## Database - Relational:



event driven cricket system where ball is the event and statistics is used to interpret the data.

### 

### Relations:



1. User - strong entity
2. Player profile - weak entity \[ depends on User ]
3. Team - strong entity
4. Team member - relation \[ between team and user ]
5. Match - relation \[ between teams and venue]
6. Ball - weak entity \[ depends on match ]
7. Player Match stat - derived entity \[ from Ball ]
8. Player stat - derived entity \[ from Player Match stat ]
9. Inning stat - derived entity \[ from Ball ]
10. Team stat - derived entity \[ from Inning stat]

### 

### Attributes :



1. User - \[ user\_id , name, email, password, phone, profile\_picture, bio , created\_at , updated\_at ]
2. Player\_profile - \[ user\_id, player\_id , player\_name, specialization, batting\_style, bowling\_style, dominant\_hand , rating]
3. Team - \[ team\_id, team\_name, logo, description, created\_at ]
4. Team member - \[ team\_id, player\_id, role\_team, joined\_at, left\_at, is\_active,
5. Match - \[ match\_id, team1\_id, team2\_id, match\_format , overs, status, toss\_winner, toss\_decision, winner, scheduled\_time, start\_time, end\_time , POTM , ]
6. Ball - \[ ball\_id, match\_id, innings\_id, over\_no, ball\_no, striker\_id, non\_striker\_id, bowler\_id,
is\_wicket, dismissal\_type,  fielder\_id , dismissed\_player\_id ,
is\_legal\_delevery, batsmen\_runs, extra\_type, extra\_runs, is\_noball, is\_wide, is\_penalty, is\_freehit ]
7. Player Match stat - \[ match\_id, player\_id, team\_id, runs, balls\_faced, fours, sizers, balls\_bowled, wickets , runs\_conceded, catches, stumpings, run\_outs,  ]
8. Player stat - \[ player\_id, matches, innings, runs, balls\_faced, fours, sixes, highest\_score, wickets, balls\_bowled, runs\_conceded, maidens, catches, stumpings, run\_outs ]
9. Inning stat -\[ innings\_id, match\_id, batting\_team\_id, bowling\_team\_id, total\_runs, total\_wickets, total\_balls, total\_extras, byes, leg\_byes, wides, no\_balls, penalty\_runs ]
10. Team stat - \[ team\_id, matches, wins, losses, ties, no\_results, runs\_scored, balls\_faced, wickets\_lost, runs\_conceded, balls\_bowled, wickets\_taken , catches, stumpings , runouts ]







* ## Authentication





### JWT for Pitchside :



Context: Pitchside has two client-facing surfaces that both need authenticated requests — a REST API (Express) for normal CRUD (teams, profiles, follows) and a Socket.io layer for live ball-by-ball score updates. The frontend (Vercel) and backend (Railway) are also deployed on different origins.

1\. Cross-origin deployment



Sessions rely on cookies, and cookies get complicated across different origins — you need to manage SameSite, secure, and CORS-with-credentials correctly just to keep the session alive between frontend and backend. JWT avoids this entirely: the token travels in an Authorization header, which works the same regardless of origin.

2\. Socket.io authentication



Live scoring runs over websockets, not plain HTTP. Session cookies don't attach to a websocket handshake the same way they do to HTTP requests — making it work requires extra plumbing (shared session store, manually parsing cookies during the handshake). A JWT can simply be passed in the socket handshake (auth: { token }) and verified the same way as on REST routes, so one auth mechanism covers both transports cleanly.

3\. Statelessness — no session store needed



Sessions require persistent server-side storage (Redis or DB-backed) to survive restarts and to work if the backend ever scales to multiple instances. JWT carries its own claims and needs no store, which removes a moving part that this project's scope doesn't justify yet.

4\. Fits the existing stack



JWT was already the planned auth approach in the V1 stack (Express + Prisma + Socket.io), so this is a confirmation of an existing architectural choice rather than an added dependency.







1. creating player - player details
2. creating team - including players, other details of team
3. creating match - including team, including player, listing balls \[with all properties0], making a score card {might be even more complex}
4. after match - update player stats, update team stats {automatic}







# 

# NEW IDEAS :



1. including a group chat place \[eliminates communication disturbances rather than calls and whatsapps, includes polls, news, macth notifications etc]
2. match challenges, approvals, match making stuff after project grows
3. ai chat bot for specific things
4. ai decision making during match like an umpire, 
5. ai visualisation and post match analysis
6. ML model for pre match predictions 







* ## Backend





