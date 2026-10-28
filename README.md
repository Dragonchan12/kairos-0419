# My CodeJam Submission.
This is essentially me working on a single project for 2 weeks straight.
AI was used as a coding assistant in this project but the majority of the work was done by me. AI was not used for story writing or UI design.

# Important Notes
This game is meant to be confusing and take a while to play through. The "twist" of the game will make itself evident about 10 minutes into playing it.
This game is meant to be decently long, if you're impatient you can go into js/constants.js and increase GAME_MIN_PER_SECOND in order to decrease the amount of time different events will take to make themselves evident.

Yes, I am being intentionally vague (much like the codejam prompt itself) because if I fully explain the game here, it will, in essence, ruin the experience of the game. Since a lot of it revolves around you not knowing.

This game does rely on you being able to connect several dots on your own, it does not hold your hand or offer you virtually any guidance. This may mean trying out random things until something works, or using clues given to you to piece together what you need to do.

# How to play

There are 2 ways to play, the first is to just open the index.html file in your browser and the game will load and run normally as it doesn't rely on any external services, it is also hosted on the domain: https://dragonchan12.github.io/kairos-0419/

## Serving the folder instead (aka host it locally not recommended cuz its harder than going to the link)

```
python -m http.server 8123 --bind 127.0.0.1
```

then open `http://127.0.0.1:8123`. 

The speed knob mentioned above is **line 7 of `game.js`**: `var GAME_MIN_PER_SEC = 0.5;`.
Raise it and the night moves faster (loop 1 at base speed is about 12 minutes of clock for 12 minutes
of watching; loops 3+ and 5+ ramp that up on their own). Set it near zero and the clock freezes, which
is handy when you want to read everything without the night running out.

## Checks

```
node tests\smoke.mjs
```

18 checks covering loop carry-over, midnight resolution, the claim route blocking the true ending, the
knowledge-only rule, the phone directory only listing numbers you have actually learned, and the paper
sources that publish lines. Expected output ends in `ALL PASS · 18/18`. Playwright is listed in
`package.json` only for optional browser QA (`npm i playwright`), the game itself never needs it.

## On the parts that do not matter

Most of what is in here is noise on purpose. The news archive, the message boards, the chat rooms, the
loose text files on `C:` and the small talk in the chat window are mostly things that go nowhere: school
notices, market stall arguments, pigeon counts, shareware high scores, bake sale plates with names written
on them. I write the noise copy. It is there so that poking at something is usually a dead end, and when
something does answer you notice the difference. Numbers you have not learned are not printed anywhere,
and dialing a number nobody gave you gets the same busy treatment as an invented one.

