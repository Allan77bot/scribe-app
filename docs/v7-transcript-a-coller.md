Chapitre 1 : Introduction to Mobile App Development
0:00Hey, this is a full course on how to build a real mobile app with cloud code.
0:033 secondesSo, from nothing to a working app on your phone, whether it's Android or iOS.
0:077 secondesI run a business that does around 300K a month, and it's almost entirely built on Cloud Code now. I've also shipped several web apps and SAS products. And the number one most requested video I
0:1515 secondesget is, "How do I take all this awesome knowledge and use it to build mobile apps?" That's exactly what I'm going to show you guys how to do today. By the end of this video, you'll have a working
0:2323 secondesapp running on your actual phone. It's not going to be a mockup. It's not going to be uh some sort of emulator. It's going to be a real app that you can show people as well as the App Store and Play
0:3131 secondesStore links. And you don't need any prior mobile development experience. If you guys can type an English sentence into a terminal, you'll be able to follow along just fine. In terms of what to expect, first I'll show you guys a
0:3939 secondesfinished app that's running on my iOS phone in under 2 minutes. Then we'll set up everything from scratch. So, Claude Code, uh the mobile development environment, and then your phone as a testing device. Then I'll walk you
0:4848 secondesthrough how mobile apps like actually work. And there are a few different frameworks you can use to build these things, but I'll focus on a couple in particular. I'll talk about React Native. I'll talk about Expo and so on
0:5757 secondesand so forth. Then we'll actually build an entire app together. I'll show you how to test them on your phone in real time as we build. Then we'll just repeat that exercise another three or four times so you guys get really used to
1:051 minute et 5 secondesbuilding apps with different levels of functionality. And at the end, I'll show you how to take these apps and submit them to the App Store and then the Google Play Store. Okay, so hopefully
1:121 minute et 12 secondesyou guys are as excited as I am. Uh use the bookmarks and chapter headings down below to save your spot and then jump around as needed. And I'll catch all y'all in the video.
Chapitre 2 : Showcasing the Habit Tracker App
1:201 minute et 20 secondesSo I have an app right over here that I want to show you guys. It's just a simple habit tracker app. Obviously, doing it in this form is kind of annoying. So, what I've instead done is
1:291 minute et 29 secondesI've loaded this up locally on my computer. And I want you guys to know from an interface perspective, it's the exact same thing. It's just you are going to need to run these on your computer in order to do the design and
1:371 minute et 37 secondesso on and so forth. That's the whole idea. Um, and as you guys can see here, it's got a simple onboarding page. I've set the resolution here to mobile. You
1:441 minute et 44 secondesknow, you can create your first habit. I don't know, maybe I want to do like a a training habit of three times a day with a specific color. And then as you guys
1:521 minute et 52 secondescould see, you now sort of have that laid out. You know, if I tap this, I can sort of fill that up logically. Um, this is more or less the exact same thing as
2:002 minutesany, you know, mobile app that you might see in the app store that does the same thing. And I did this in legitimately less than 5 minutes using cloud code and then a couple of cute little prompt
2:082 minutes et 8 secondestemplates that uh allow you to build these sorts of things and scaffold them really quickly. Now, the development system I'm going to show you guys in today's video is going to involve
Chapitre 3 : Understanding the Development System
2:162 minutes et 16 secondesdeveloping it as a web application first. So, that is something that is accessible in a web browser. The benefit there is obviously you can design something and then push it out for the
2:242 minutes et 24 secondesweb. So you can have it on a website. Uh and then you can also port it over to your phone. Then we can optimize it for phones as well as things like tablets and so on and so forth. And it's
2:322 minutes et 32 secondesprobably the simplest and and most straightforward one. But I also want to be clear that it's not the only way to build an app. I'm also starting off with a cute little habit tracker example here
2:392 minutes et 39 secondesjust because this usually involves most of the functionality that people want in an app. Usually you want some sort of database of some sort. You want a way to
2:472 minutes et 47 secondesread the database. You want a way to, you know, send information to the database, modify it. Then you want some sort of front-end feature that, uh, you
2:542 minutes et 54 secondesknow, interacts with the database in a particular way. You want, you know, some sort of authentication setting, which I'll show you guys how to build. Uh, and then, you know, you want some sort of like cute little functionality. But by
3:033 minutes et 3 secondesno means is this the only sort of app you can build. You can build literally anything. As we progress through the the course, I'm going to show you guys how to build apps that use AI to do really
3:113 minutes et 11 secondescool things. For instance, this app, Cal AI, is a good example of, you know, weaving AI into traditional app functionality. you can take a photo of something and then, you know, send it
3:183 minutes et 18 secondesoff to an API. They just sold for $50 to $100 million, I think, to My Fitness Pal. So, you'll get to the point where you can build apps just like this. We'll use similar sorts of designs and stuff
3:263 minutes et 26 secondeslike that, um, by the by the end of this course. And so, the progression I want you guys to think about is we're going to start over on the left by building a local habit tracker app. That's going to
3:353 minutes et 35 secondesinclude no API. So, we're not going to send or receive requests to any third party services. We're just going to store it all locally. Um, we're not going to have any sort of database.
3:433 minutes et 43 secondesWe're just going to do it sort of directly on our phone or in the local storage. From there, we're going to add an API on. And so, you know, we're going to be using functionality that somebody
3:513 minutes et 51 secondeselse has created, but we're going to wrap that in our app. Then, we're going to add a database on. Then, we're going to push this over to a cloud solution.
Chapitre 4 : Building the App from Scratch
3:593 minutes et 59 secondesAnd then, finally, we're going to have cloud. We're going to have an API. We're going to have authentication. So, we're going to have some sort of login screen and then a database more similar to that app that sold for, you know, between $50
4:084 minutes et 8 secondesto $100 million. So, whatever your goals are, you'll be able to meet them in this course. I just want to make sure that everybody's on the same page here. So you don't see me developing a habit tracker app and be like, "Oh my god,
4:164 minutes et 16 secondesthis is such a crappy thing. Why the hell would anybody you design the 100th habit tracker app? The the habit tracker app is the means to an end. It's not the actual end itself." Okay, without
Chapitre 5 : Setting Up Cloud Code
4:244 minutes et 24 secondesfurther ado, let's actually talk about how we're going to build this, including cloud code, setting up our development environment, and then also setting up our phone as a testing device before doing some some real basic dev, just to
4:334 minutes et 33 secondesshow you guys what this looks like in practice.
4:364 minutes et 36 secondesSo step one of building mobile apps with cloud code is having Cloud Code. And so in order to do that, just go to claw.ai/lo.
4:454 minutes et 45 secondesYou'll see a page that looks something like this. Obviously, their design may have changed by the time that you guys are taking a look at it. And then you can either continue with Google or enter
4:534 minutes et 53 secondesyour email. So I'm just going to enter my email address. After that, you'll get an email sent that allows you to sign in. And then once you're signed in, you'll have a variety of different plans
5:015 minutes et 1 secondeshown to you. Now, I'm actually already on the highest plan over here called the Max, but you guys are fine signing up with the Pro, at least for this demo.
5:105 minutes et 10 secondesAnybody scawking at the price, 20 bucks a month is probably the highest return on investment you will ever get. I use Cloud for more or less everything. Now,
5:175 minutes et 17 secondesuh, as mentioned, this several hundred a month plan legitimately runs a $300,000 a month business. So, talk about ROI.
5:245 minutes et 24 secondesPersonally, I would just get at least one month, learn as much as you can, and then if you want to experiment with local models and other approaches and stuff like that to save on costs, feel
5:325 minutes et 32 secondesfree to do that. It's just best to learn at least initially from the source. So, I'm not going to click downgrade because I already have my account. But assuming that you do, it'll take you to a quick payment page and then you can customize
5:415 minutes et 41 secondesyour clot. And then once you're done, you'll have a page that looks something like this. So, I'm just going to say, "Hey, what's going on?" And uh Claude will get back to me essentially giving me a response. What's on the docket?
5:515 minutes et 51 secondesPeople even say that anymore. I don't know. Now, the thing to know about Claude, if it's the first time you're using it, is this right here is your Claude chat. Okay? But in order to do
6:006 minutesthings like develop and design mobile apps, we got to move away from the vanilla cla, we got to move towards a
6:066 minutes et 6 secondeslittle more complex of a feature called claude code. Now claude code has a bunch of different ways to visualize and use.
6:136 minutes et 13 secondesOkay? And this little space invader down here is going to be omnipresent if you're doing coding, so get used to it.
Chapitre 6 : Using the Cloud Code Interface
6:186 minutes et 18 secondesUm, you can do so directly in the claude code web app here. You can also download the desktop app, which little button at
6:276 minutes et 27 secondesthe bottom lefthand corner. So you can download for Mac OS or Windows or you can use a third-party service like anti-gravity or Visual Studio Code to
6:366 minutes et 36 secondesmanage all of your files and then also communicate with Claude. And in my case, I much prefer that last option. And that's what this looks like here. You
6:436 minutes et 43 secondesbasically have a little cloud code window open. You have all your files on the left hand side. And then what's really cool is because you have this
6:506 minutes et 50 secondesmuch granularity and access to all of the files, uh, you know, you can usually build much more sophisticated sorts of apps. So that's what I'm going to be
6:586 minutes et 58 secondesusing throughout this course. But I do want you guys to know you can use whatever interface you want. The reality is these are all just wrappers around like the brain of the model, the the
7:067 minutes et 6 secondesactual intelligence. Whether you communicate with, you know, an uh integrated development environment style app like me, or whether you communicate with claude code, you're just using the
7:157 minutes et 15 secondesclaude.ai/code website, all of this is is the same thing at the end of the day. Now, if you want to follow along with my tutorial,
7:237 minutes et 23 secondeshow to set it up in this sort of interface. Well, you've already signed up to Claude. So, you only need one more thing, and that's the actual app itself.
7:307 minutes et 30 secondesSo, in my case, I'm using this app developed by Google called Anti-Gravity.
7:347 minutes et 34 secondesAnti-gravity is pretty great. It's just really simple. It shows all your files and stuff like that. It's technically a Google product, so they're going to try and use their own models, or at least
7:427 minutes et 42 secondesget you to, but I'll show you guys how to avoid that. just head over to that download page, check your whatever operating system you're in, and then
7:497 minutes et 49 secondesdownload the correct uh executable for you. So, in my case, that's Apple Silicon. Then, all I have to do is click on this little anti-gravity 1dmg.
7:587 minutes et 58 secondesObviously, this will be a little different if you guys are in uh you know, Windows or something else. And then in my case, all I have to do is just drag this little anti-gravity thing over to the applications folder. Now,
8:068 minutes et 6 secondesafter I do that, I'll get a page that looks something like this. So, there'll be a little anti-gravity logo. There'll be a little agent panel on the right hand side. may seem really intimidating.
8:158 minutes et 15 secondesDon't worry too much about this. Just going to close the agent view and then head over here to where it says extensions. And the extension that I'm looking for is called the Claude Code for VS Code extension.
8:258 minutes et 25 secondesSo, I'm just going to type Claude Code for VS. And then you can see that we have the Cloud Code for VS Code extension right over here. Now, in my case, I've already installed it, but all
8:338 minutes et 33 secondesyou have to do is just give it a quick install. I'm just going to click auto update here and then maybe go install specific version and then update to the most recent just so you guys can kind of
8:418 minutes et 41 secondessee what it would look like when it's installing. So, boom. I just installed mine. What's really cool is after you're done. Okay. Uh, you'll see this little
8:498 minutes et 49 secondesclawed icon pop up everywhere. So, I'm just going to exit out of this. And then I'm just going to double click anywhere on the page to open a new file. And then you'll see that little claw icons
8:578 minutes et 57 secondesanywhere. So, now if we just click this and then exit out of all this other confusing stuff, you'll see that we basically now have a chat with Claude and we have that little space invader.
9:069 minutes et 6 secondesSo, now I can say, "Hey, what's going on?" And then it can get back to me saying, "Hey, how can I help you today?" If that doesn't happen, you may need to
9:139 minutes et 13 secondeslog in, in which case you /lo, type claude account with subscription. That's then going to open up a page, which will basically do the same thing that you did
9:209 minutes et 20 secondesa moment ago where you where you logged into your anthropic uh account. In any case, the whole idea is to get a screen that looks something like this. As long
9:289 minutes et 28 secondesas you have a cute little Claude Code guy somewhere on the page, you're good to go. From here on out, I'm just going to send a couple of brief prompts over
9:369 minutes et 36 secondesto Claude Code and have it build us something really quick just so you can convince yourself that it's indeed working. So on the lefth hand side, there's a little open folder button. I'm
9:449 minutes et 44 secondesjust going to click open folder and then I'm going to go new folder and I'll say, I don't know, example project. The reason why I'm doing this is because, you know, we want to be able to see the
9:529 minutes et 52 secondesfiles that Claude outputs. Now, every time I do this, just because of the fact that Google's trying to push their own products, it's going to change the interface and so on and so forth, right?
10:0010 minutesSo, I'm just going to have to reopen up a little Cloud Code terminal and exit out of the the native Google one. Once we do that, we'll have Claude saying, "Welcome back." And I'll say, "Hey, make
10:0910 minutes et 9 secondesme a really simple onepage site in the current directory." Then open it. This really simple onepage site isn't a lot
10:1710 minutes et 17 secondesof context. Might ask you some questions, might not. The whole idea is I'm just going to show you guys how easy it is to build a web property. Okay, so now we have a web property set up here.
10:2610 minutes et 26 secondesClaude actually just built this. I could say adjust this So, it greets me, Nick.
10:3310 minutes et 33 secondesAnd now, if I go back to that page here, um, you know, after it makes the edit, you can see that it just swapped the name from world to Nick. Okay, so
10:4010 minutes et 40 secondeshopefully you guys see it's not very complicated or difficult to build things. Usually the more difficult part is just building the right things and then getting those things onto the
10:4910 minutes et 49 secondesinternet somehow, but don't worry about it. I'm going to show you guys how to do all of that as well. So, now that we've figured out how Cloud Code works and done a quick little demo, let's move
Chapitre 7 : Transitioning to Mobile App Development
10:5710 minutes et 57 secondesinto our mobile app development environment. It's clearly one thing to build a website like I just did here, right? And this is currently existing on
11:0511 minutes et 5 secondesmy computer. But if I want to get this over to my phone and then not only do I want to get it over to my phone, but if I want to share it with, you know, potentially hundreds of thousands of
11:1211 minutes et 12 secondespeople and make something viral, we got to go one step further. The way to build an app nowadays tends to revolve in one
11:1911 minutes et 19 secondesof these three uh methods. Now, don't worry too much about the terminology or the platform names. You don't need any experience or any fun familiarity with
11:2811 minutes et 28 secondesthis stuff. I'm going to walk you guys through it all regardless. But basically, there are three current methods. The first is using something called Expo and React Native. And this
11:3611 minutes et 36 secondesis uh actually the preferred approach that I'm going to show you guys how to do. Essentially, what we're doing is we're making use of a particular set of programming languages. So, JavaScript
11:4311 minutes et 43 secondesand TypeScript. We then have one codebase. And this codebase allows us to push out to our iOS apps. It also allows
11:5111 minutes et 51 secondesus to push to uh Android and then as mentioned you can even open up like a web app as well. So you can have it like you know on a website somewhere. Um you
11:5911 minutes et 59 secondesdo cloud builds via the expo I think like app building system. Uh that's more technical terminology but essentially that just offloads a lot of the work
12:0712 minutes et 7 secondesonto a standardized tool that just knows how to do the sorts of builds that we're talking about get things ready for deployment. It's got a really huge
12:1512 minutes et 15 secondesecosystem of supported apps and other files. Then it also allows you to do hot reload on device and that's valuable especially for testing purposes because
12:2412 minutes et 24 secondesyou typically have to reload the app over and over and over again. And so this is what we're going to be doing um for our app. We're going to be using Expo and React Native. And I'm going to
12:3212 minutes et 32 secondeswalk you guys through, you know, how all of that works in a moment. But I also wanted to run through a couple of the other common ways because hey, if you clicked on a course that's multiple
12:4112 minutes et 41 secondeshours and then you decided to learn all about app development, you might as well learn some of the lingo so that when you're talking to your app dev friends and they say they're using capacitor or
12:4912 minutes et 49 secondesflutter and firebase, you know, you can actually reason with uh with them reasonably well. Okay. So everybody else
12:5612 minutes et 56 secondesbasically uses tools like flutter and firebase. And so this takes advantage of a different language called Dart. Okay,
13:0313 minutes et 3 secondeswhich is I think customdeveloped uh by Google specifically for the purposes of designing apps for their Android ecosystem. It also involves their own UI
13:1113 minutes et 11 secondestoolkit. The value there is basically Google has their own really opinionated like design system. If you've ever been on like a an Android app, for instance, you'll know the buttons tend to look
13:2013 minutes et 20 secondespretty similar. You know, the modals tend to look pretty similar. All that stuff is very like opinionated. It's very set. And the benefit there is when you have an opinionated design system,
13:2813 minutes et 28 secondesit's pretty easy to put something together. You just kind of borrow their design. And you don't have to build that stuff from scratch. But obviously the downside is you get limited in what you
13:3613 minutes et 36 secondescan do with the design. You know, if you think back to my little habit tracker app, the streaks, which I'll walk you guys through in a moment, you know, this uh design is a really particular style
13:4413 minutes et 44 secondesthat you probably wouldn't see in an Android app right out of the box. We're using slightly different fonts like serif fonts. The um little containers and stuff like that have different sort
13:5213 minutes et 52 secondesof like border and uh you know, corner radius. That's like the curve. You know, you have different types of capitalization and stuff like that. and
Chapitre 8 : Exploring App Development Frameworks
14:0014 minutessome of the interactivity, the little bounces and stuff like that just look different. So that's that that's that opinionated design. This is me making one up myself and and ultimately I think that's what most people want. They want
14:0814 minutes et 8 secondesthe ability to design their own app the way that they want to. What's cool is they also allow you to use their own backend. So Firebase and all of the uh
14:1614 minutes et 16 secondesapps are very like well optimized to use Firebase. Okay, which typically means you know for enterprise level stuff you get faster reads, faster writes and so
14:2414 minutes et 24 secondeson and so forth. Um these are those material design widgets that I was talking about. it's part of their their UI toolkit. Then it's also compiled to native ARM processors which again is
14:3214 minutes et 32 secondeslike a highly optimized thing. It allows the app to run better on you know their their devices. Um so there's nothing wrong with using this approach. I just am choosing not to in this course
14:4114 minutes et 41 secondesbecause you know I don't really want anybody have to worry about languages that aren't really well understood. I don't really want you to feel locked into Google's in my opinion not as nice
14:4914 minutes et 49 secondesUI. And then I don't want you to have to worry about you know choosing the Firebase database or uh you know high level performance optimization. And I want you guys just to like worry about
14:5714 minutes et 57 secondesgetting an app out. Finally, there's Capacitor, which I believe some might think is even easier to use than Expo and React Native. Um, it it's it is
15:0515 minutes et 5 secondesreally easy to use. You basically just like build a website. Okay, so literally this website right over here, and then you just wrap it with features that allow you to export that to, you know,
15:1315 minutes et 13 secondesthe app store and whatnot. Um, it uses languages that most people are really familiar with like HTML, CSS, JavaScript, and stuff like that. Uh, you can access your device APIs via plugins.
15:2315 minutes et 23 secondesSo, it adds like an additional layer between the device and then, you know, the functionality that you want your app to have and then your website. And then it's also really, really easy to
15:3115 minutes et 31 secondesmigrate. But, you know, you're here to learn how to build apps first, not necessarily websites. I have a lot of great tutorials that show you guys how to build the best websites ever. Um, I
15:3915 minutes et 39 secondesfind if you are optimizing for everything right off the the get- go, you're probably not as good at anything in particular. And so this to me strikes a really good balance between like hyper
15:4815 minutes et 48 secondesoptimized, you know, appdev in a specific language, in a specific database type, and then really general sort of website stuff. I know the app
Chapitre 9 : Getting Started with Expo and React Native
15:5515 minutes et 55 secondesdevelopers in the comments are probably already about to skewer me, but that's okay. Let's just get you up and running with Expo and React Native. So, how do you actually get set up here in Expo and
16:0416 minutes et 4 secondesReact Native? Well, the first thing I'm going to do is I'm just going to use a built-in slash command called slashclear. And that's just going to get rid of all of the conversation history
16:1216 minutes et 12 secondesthat I had with um you know Claude previously. The benefit there is it's also going to keep my token count a little bit lower and uh ensure that whatever I'm working on is just as as
16:2016 minutes et 20 secondesefficient as humanly possible. Now inside of my little folder example project with this index.html that I put together here, what I'm going to do is just rightclick this. I'm just going to
16:2816 minutes et 28 secondesdelete it because I don't really want, you know, anything in my folder for what I'm about to say next. And then all you have to do is say, I want to build a mobile app with Expo and React Native.
16:3916 minutes et 39 secondesSet up my workspace for me. Now, if it's the first time you're using Claude, let me just zoom out of this and then click on this button right down here, then
16:4716 minutes et 47 secondesclick settings. And there's actually a uh little toggle that allows you to allow dangerously skip permissions. So, that's personally what I click by doing
16:5516 minutes et 55 secondesthat. Uh Claude just, you know, can do whatever the heck it wants. I don't really have to wait for it to to work and so on and so forth.
17:0117 minutes et 1 secondeOkay, great. So, if we head back over here to folders, which I actually see everything that's laid out, you'll see that Claude now has like created a whole workspace. And um it really is as easy
17:1017 minutes et 10 secondesas that. Rather than try and, you know, download a template from somewhere or whatever, what it's doing is it just it already knows about Expo's setup. It already understands the different files
17:1917 minutes et 19 secondesand stuff like that that you need in order to create like a working app. Um and you know, now now we basically have something. So, what I'm going to say is
17:2517 minutes et 25 secondeslike create a simple demo application, some habit tracker for demo purposes, and then let me launch it on my phone.
17:3617 minutes et 36 secondesOkay. So, what it's going to do now is it's going to plan out a habit tracker demo app, probably pretty similar to the one that I showed you guys, although I'd imagine with much simpler features. And
17:4517 minutes et 45 secondesthen it's going to go ahead and do the building. And this is not rocket science. As you guys could see, I've just made a couple of simple requests.
17:5217 minutes et 52 secondesUm, you know, it's not as easy as it seems necessarily. There are a couple of technical things and issues that you'll run into if you don't know what you're doing. So, I'll walk you through that
18:0018 minuteswhen it comes up. All right. Now, it's taken about a minute and a half to 2 minutes here to plan out the habit tracker demo app. You may be, you know,
18:1018 minutes et 10 secondesreally chomping at the bits to just skip to the end and so on and so forth, but I encourage you to to watch alongside me.
18:1618 minutes et 16 secondesyou know, I'm trying to strike a good balance between submitting a message and then immediately jumping to the finished output. Um, I don't want to do that
18:2418 minutes et 24 secondesbecause I think it's important for you guys to realistically see how the tokens are generated and what the model is saying at every step. But, uh,
18:3218 minutes et 32 secondesunderstand that any sort of development with agents involves offloading your own brain a little, right? Your own intelligence. And so, you do have to
18:4018 minutes et 40 secondeswait a fair amount of time for it to work. Now, it'll give you a bunch of fancy pants code. code and this code might be kind of intimidating. What this is doing is it's just it it is currently
18:4818 minutes et 48 secondesperforming the writing action of like putting this in a file somewhere so that it can work with it. If you guys see
18:5518 minutes et 55 secondeserrors pop up and stuff like that, don't worry too much about this. What's really cool about claude is it's capable now of
19:0219 minutes et 2 secondessolving its own problems, which uh I like quite a bit. And as we progress through the course and I show you guys better ways of doing things, you'll also
19:1019 minutes et 10 secondesfind that you can instruct Claude very high level using what's called a system prompt to get even more autonomy where
19:1819 minutes et 18 secondesyou want it to and then less autonomy in places that you don't. Okay, so what is it telling us? It's saying the app is now ready to run. Here's what I built.
19:2619 minutes et 26 secondesThe today tab, the manage tab, and some data persistence. So this is currently storing locally. I just asked it to build demo, which I usually does in a
19:3419 minutes et 34 secondeslocal way. There's no database. There's no nothing. Now, it's actually giving us some instructions here. It's saying, "Hey, could you install Expo Go from the
19:4219 minutes et 42 secondesApp Store or the Play Store, then run this function, and then scan the QR code with your phone's camera or the Expo Go
19:4919 minutes et 49 secondesapp?" You're probably like, "What the hell does this mean?" Well, we actually want to get this thing live on our phones, right? So, that's what I'm going to show you guys how to do. This demo app that they just built. In order to
19:5719 minutes et 57 secondessee it, what we have to do is we have to go down to the App Store. Okay? And in order to show you guys that, I'm just going to use this iPhone mirroring app so you guys could see everything that
20:0520 minutes et 5 secondesI'm doing on my phone. Um, I don't think there's any way to make this any bigger, unfortunately. So, just zoom in as much as you guys can and uh take a look at
20:1320 minutes et 13 secondeswhat I'm doing. First things first, we're going to have to go uh app store right over here. Then once I'm in the app store, I'll go search. And what I
20:2220 minutes et 22 secondeswant to do here is I want to just type Expo Go. So now I'm on my phone literally doing this. Um, and I've already downloaded and installed Expo
20:2920 minutes et 29 secondesGo. So, in my case, it'll say open, but this is the one that you want. So, you're going to install it, and then that'll move us over to a page that looks something like this. If you have
20:3720 minutes et 37 secondesany recently opened apps, then uh they'll pop up down there. That's my little streaks app that I was showing you. Okay, great. Once we have this, you do need to log in or sign up. And so,
20:4620 minutes et 46 secondesI've actually already created an account here, just uh Nikki Jer. So, I'm going to give that button a quick click. And now, you'll see it's actually giving you some instructions. It'll say, "Start a
20:5420 minutes et 54 secondeslocal development server with this command, npx expo start." Now, one thing that you'll find is AI from time to time
21:0121 minutes et 1 secondewill give you instructions suggesting you have to do stuff yourself. Well, one of the highest star things you can start doing right now is just asking to do it
21:0921 minutes et 9 secondesfor you. It's trying to hand this off to you because of the way that it was trained. And basically, the way that it was trained is sort of like following
21:1621 minutes et 16 secondesinstructions. You know, it was it's read a bunch of guides on how to do this sort of thing and it sort of compiled all that. And so, it thinks that it needs you to launch this sort of thing. It
21:2421 minutes et 24 secondesneeds you to like submit this command and stuff like that. but you don't actually have to um do this for me in a
21:3121 minutes et 31 secondesnew terminal window to me does like 80 to 90% of the work. So what it's going to do now is it's basically going to open up a new terminal window. Okay,
21:4021 minutes et 40 secondesit's right over here. And if I zoom way in this new terminal window here now is being managed by AI. Okay. And one thing that you're going to see immediately is
21:4821 minutes et 48 secondesit's going to pop up with this big sexy QR code. And all we have to do in order to actually run our app now is I'm just going to open it up on my phone. I'm
21:5621 minutes et 56 secondesgoing to scan the QR code, open up the EXP link. My case, I have to enter my passcode.
22:0322 minutes et 3 secondesAnd now it'll jump directly over to the app. I'm just going to run this uh locally here for a sec before showing you guys on the iPhone mirroring app.
22:1122 minutes et 11 secondesAnd then we actually have the little habit tracker app that is running on our on our phone. Okay. So, let me just show you guys what this actually looks like by running the iPhone mirroring app.
22:1922 minutes et 19 secondesAgain, moving that over and then connecting. Uh there are equivalents for Android, of course. So, I'm just using iPhone here for simplicity. And you see we now we now have our app right now.
22:2922 minutes et 29 secondesThis isn't perfect. There are a couple of issues already. You can see down at the bottom it says uncaught for promise ID 1, whatever. Don't worry too much about that. Just focus on like the core
22:3722 minutes et 37 secondesfunctionality. You know, we actually have something that's working, right? We have a couple of basic apps here. And you know, it looks like when it's done, it says all done for today. And so,
22:4622 minutes et 46 secondeswhat's really cool is this is just running on my phone. And it's running um basically using an emulator to show you what this would look like if it were
22:5322 minutes et 53 secondesactually like fully uh built. and and live and stuff like that. Okay, so that is the mobile development environment that we're going to be using. Um, we're
23:0023 minutesgoing to be using this Expo Go sort of like QR code scan thing and then we're just going to be showcasing it locally right over here. Um, I don't just do it
23:0823 minutes et 8 secondesusing an mirroring method like this. I'd highly recommend if you guys are actually testing this to like do it on the phone itself. Um, just understand that I have to do this in order for you
23:1623 minutes et 16 secondesguys to see what this would look like um, for tutorial purposes. But what's really cool is when you do it on your phone, um, you know, you you you get to see if there are any like navigation or
23:2323 minutes et 23 secondesUX issues. Sometimes there are issues with like you, you know, I don't know, this sort of like pull and and drag functionality. Sometimes there's hidden
23:3223 minutes et 32 secondesfunctionality that you won't know, uh, where you drag to the left and the right and so on and so forth. And, uh, yeah.
23:3723 minutes et 37 secondesAnyway, I guess what I'm saying is I'd recommend just doing it on your phone.
23:4023 minutes et 40 secondesAnd so, one thing that I'm realizing with my phone is it actually created an entirely new page called um, create a new habit. And so here I'm capable of sort of creating my new habits and and
23:4823 minutes et 48 secondesclosing them out and stuff like that. I wouldn't have known that if I didn't go on my phone. Okay. So now what we've done is we've set up both cloud code
23:5623 minutes et 56 secondesthen a mobile development environment and we've also shown you guys how to build the testing loop onto a mobile device. From here on out we can actually
Chapitre 10 : Designing a Successful App
24:0424 minutes et 4 secondesget started with the best and most exciting and enjoyable parts the actual app development itself. Let's do it. All right. So we've clearly seen that it's
24:1124 minutes et 11 secondespossible to build an app. Now that we know that you can do more or less anything under the sun with technology, how do you actually design like a good
24:1924 minutes et 19 secondesapp? And what you'll find is in our current lovely society, uh we can more or less do whatever the heck we want.
24:2424 minutes et 24 secondesIt's actually just about taking all of that power and potential and then orienting in the right direction. In our case for mobile app design, what good
24:3224 minutes et 32 secondesapps look like are apps that satisfy and sort of go through all five of these steps. So, in general, any good app, and
24:4024 minutes et 40 secondesI'm just going to use our habit tracker as an example, needs what's called a core function. And that is the one thing essentially that if you removed
24:4924 minutes et 49 secondeseverything else from this app, the app would still be the app. Okay? Like for instance, in our habit tracker app, if you removed all of the accessory
24:5724 minutes et 57 secondesadditional features away from our, you know, habit tracker app, all the cute little colors in that prior example, uh, all the different types and so on and so
25:0525 minutes et 5 secondesforth, maybe the settings page. If you stripped all of that away, the one thing that would remain is there's probably going to be a way to like create a habit
25:1325 minutes et 13 secondesand then tap on it and every time you tap on it, it it logs it to some database. That's sort of like the core functionality, the fact that it tracks a habit. Right? Now, after we're done
25:2325 minutes et 23 secondesdefining that one thing, okay, what we're doing next is we're turning that one thing into a feedback loop. And so
25:3025 minutes et 30 secondesin any sort of like user experience design, any sort of uh game design or anything like that, what you need is you need a cycle that maps an action to a
25:3925 minutes et 39 secondesreward. And ideally that action and reward loop is under about 30 seconds or so. Now obviously this whole idea of a
25:4725 minutes et 47 secondesloop is sort of uh you know it depends on whether you're working in with a game let's say you know if you're doing like a mobile game for instance the loop is usually going to be a lot tighter.
25:5525 minutes et 55 secondesthere's going to be a lot more rewards and it's going to be like a lot more dop dopamineergically stimulating than something like a habit tracker app or something like a calorie tracker app.
26:0326 minutes et 3 secondesBut what's cool is you can still take all of those same ideas and features right the fact that you perform an action and then receive some sort of reward um whatever it is that you are
26:1126 minutes et 11 secondesbuilding. And so for instance in our case right what we want to do is every time somebody you know does a habit okay
26:1826 minutes et 18 secondesaka creates one and or fulfills one we need some way of rewarding them. And usually the way that we're going to reward them is we're going to reward them using some sort of visual stimulus.
26:2726 minutes et 27 secondesOkay. So just because I want to keep track of everything here, I'm just going to move this down a bit. And then I'm going to just sort of um annotate here.
26:3426 minutes et 34 secondesAnd I'll say the whole idea with our core function is we want to track a habit. And the whole idea with our core loop is we just need some sort of like
26:4126 minutes et 41 secondesstimulating reward. Okay? And variety of different ways to do this. We want like a nice sound to occur every time I tap the button for instance. We want some
26:4926 minutes et 49 secondessort of like nice animation to occur every time I tap the button. If we do uh our habit goal for a certain amount of time, maybe we want cute little confetti
26:5726 minutes et 57 secondesto rain down from the the top of the screen. We just need some sort of like visual reward stimulus. Some apps go really far with this. Um I'm using one mobile app right now called Opel, which
27:0627 minutes et 6 secondesis like a it's like an app blocker, which basically eliminates my ability to use YouTube and, you know, X and all these different social media platforms
27:1327 minutes et 13 secondesbetween certain hours of the day. And what I really like that they do is they will like create a little gem for you.
27:1927 minutes et 19 secondesAnd the more days that you block an app, the cooler and more exciting the gem gets. You know, at the very beginning of the day, they they're like, "Hey, here you just unlocked this normal basic gem." And you're like, "All right, cool.
27:2927 minutes et 29 secondesWhatever. It's a normal basic gem." But a week or two in, you know, after you've been blocking it consistently for a long period of time, the gem is now super shiny. It's amethyst. It's, you know,
27:3727 minutes et 37 secondesuh, kind of in the name Opal. And I'm not sponsored by them or anything. I just really like their app. um you know it just gets cooler and cooler and cooler and so human beings were very
27:4627 minutes et 46 secondeslike tactile creatures right in general anytime you're designing an app you need to take advantage of that tactile nature um you know your phone has the ability
27:5427 minutes et 54 secondesto uh perform haptics right like vibrate for instance when you fulfill one of these things like there there are multiple ways to stack that on but
28:0128 minutes et 1 secondebasically what we want is you know user taps habit and then we want the uh uh habit
28:1028 minutes et 10 secondesto reward reward, okay, the user. And this mechanism right over here, this can get about as complex as you want. You
28:1928 minutes et 19 secondescould add on like financial, monetary rewards, their apps, and uh and have it sort of accountability partners now where like you give a certain amount of money to a friend if you miss a whatever
28:2728 minutes et 27 secondesthat is. That core loop in our case is going to be really simple, but you can make that as complex as you want. Okay. After that, we need accessory features.
28:3528 minutes et 35 secondesSo, you know, we started with the core function, then we defined the core loop of actions that the user is going to take with the core function. Now we need some form of like accessory. So what
28:4328 minutes et 43 secondeswraps around that core loop and core function and I don't know just adds to it. So for instance um every one of the things I'm about to say support that
28:5228 minutes et 52 secondesmain loop of you know creating a habit um you know tapping a habit essentially to fulfill it and then sort of receiving some sort of immediate reward. Uh well
29:0129 minutes et 1 secondeyou're probably going to want a list of all the habits and uh uh uh times that you've tracked all these individual habits in the past. So, for instance, when we set up our database, you're
29:0929 minutes et 9 secondesgoing to need some way that, you know, a user can log the fulfillment of a habit and then, I don't know, a week later can still go back and see, oh, you know, on May the 4th, I actually logged X habit.
29:1829 minutes et 18 secondesOn May the 3rd, I actually logged Y habit. Why? I don't know. I mean, that that that's valuable in and of itself.
29:2329 minutes et 23 secondesMaybe you could tie that to some sort of like visualization chart or something like that, right? So, I'm going to say chart plus logging. That's a really cool
29:3029 minutes et 30 secondesaccessory feature. Um, you know, you should be able to customize your habits.
29:3429 minutes et 34 secondesIf you think about it, not all habits are the same. Habits that occur, you know, on a daily basis, just once might be sort of like a zero or one sort of habit. It's like you either do it or you
29:4229 minutes et 42 secondesdon't. But habits that uh I don't know, you need to do multiple times a day.
29:4529 minutes et 45 secondesLet's say you have a habit of like I want to drink water. Maybe you know you count the number of cups that you drink or something like that. So we need like multi-
29:5429 minutes et 54 secondestier habits for instance. And then maybe you also want and I don't think I'm going to add this to our specific app at least initially, but maybe you also want
30:0230 minutes et 2 secondeslike a social feature, right? What good is tracking a habit if you can show it off a little bit? And so I'm seeing a lot of these sort of like habit tracker apps implement social functionality
30:1030 minutes et 10 secondeswhere you can like add your friends. You can get little notifications when the other person submits a habit or something like that. Um, so these are all just ideas and examples of accessory
30:1830 minutes et 18 secondesfeatures that don't actually fundamentally change the core function or the core loop, but you know, they allow you to do slightly different things. They allow you to cover a little bit more ground. And it's important that
30:2730 minutes et 27 secondesyour app has, you know, all all three of these. Okay. After that, I'd recommend a surface area check. So typically when
30:3430 minutes et 34 secondesnew people start developing mobile apps and really just any apps in general, they get really really excited. And so they'll they'll instead of just do one core function, they'll do 10. And then
30:4230 minutes et 42 secondesinstead of uh one core loop, they'll do a 100. And then instead of just a couple of accessory features, they'll do a thousand. And then before you know it, your app has like 5 million pages and
30:5030 minutes et 50 secondesit's just very very complicated. Well, in a world where you can do everything, typically it's not about doing everything. It's about doing one specific thing fairly, really well. And
30:5830 minutes et 58 secondesthe best way to facilitate that is by just making sure that your app isn't super complex. And so, you know, as part of implementing these features, we're probably going to need a couple of
31:0631 minutes et 6 secondesdifferent screens, right? We're going to need like, I don't know, a habit creation screen, a habit tracking screen, and so on and so forth. Um, that can be thought of as digital surface
31:1431 minutes et 14 secondesarea. If that digital surface area gets too large or there are too many paths and whatnot, the user is going to get very confused. And so, we we don't want to do any of that. We want to make sure that there's just a very simple core
31:2331 minutes et 23 secondesloop facilitated by a handful of screens. And uh you know it's simple enough that that the user just uses the app once. We don't need to explain it to them. We don't need to like basically
31:3131 minutes et 31 secondesget them a PhD in our habit tracking app in order to to to learn to use it. Uh one run through is basically everything they need in order to onboard and know
31:3831 minutes et 38 secondeshow to use our app properly. Okay. And then finally we need some sort of retention hook. Uh and so what I mean by retention hook is we need some form of
31:4731 minutes et 47 secondesway to create an unfinished state that the user has to come back to after a certain period of time in order to finish it. So, in our case, you know, if
31:5531 minutes et 55 secondeswe're doing a habit tracker app or something like that, uh there variety of different ways to do this, but essentially, you know, you could have some form of challenge or something
32:0332 minutes et 3 secondeswhere it's like, uh, oh, hey, you know, you you join the app and then you have a 3-day challenge where you log a habit 3 days in a row, and it's sort of inherently retentive, right? Because in
32:1132 minutes et 11 secondesorder to achieve the 3 days, you need to go on the app three separate times over the course of a 72-hour period. Uh likewise, you could maybe have it so
32:1932 minutes et 19 secondesthat you know you you start the app, you click a button, and then it actually checks in with you, let's say a few hours later to see how your progress towards the habit is, whether whether or
32:2732 minutes et 27 secondesnot you've done the habit. Maybe uh the very first thing we do in an onboarding in our onboarding for a habit tracker app is it's like, okay, create the a
32:3532 minutes et 35 secondeshabit and then we'll check in with you before you go to bed at the end of the day to make sure that you've done the habit. Then all you have to do is just tap one button and then you know you can
32:4232 minutes et 42 secondesyou can log it. Obviously a variety of different ways to take it there, but the whole idea is like you don't just build an app so that people use it once and then uninstall it, right? Any app that's
32:5032 minutes et 50 secondesever trying to tell you that that's their goal is lying to you. The whole job in app development is you want people coming back to the app and so you have to take advantage of some sort of
32:5732 minutes et 57 secondesdark patterns in user behavior like retention in order to do it. Uh but retention hooks are very very important.
33:0333 minutes et 3 secondesAnd so what I'm going to do at least to start is I'll just do like a 3-day challenge. And it's just going to be, hey, can you log whatever the habit is that you want to do? You know, drink
33:1133 minutes et 11 secondeswater. uh I don't know do 20 push-ups uh I don't know read for an hour or whatever can you log that every day for three days and assuming you can you have
33:1933 minutes et 19 secondesyour app okay so what we just did is at a very high level we just designed the app you know it's one thing to uh build it in code and whatnot but it's another
33:2733 minutes et 27 secondesthing entirely to understand like why you're doing what you're doing and so I just wanted to take a couple minutes that we were all on the same page that like that is how you design an app you
33:3533 minutes et 35 secondesgo through the core function then you uh ideate the core loop then you figure out some accessory features you do a surface area check make sure your surface area
33:4233 minutes et 42 secondesisn't super bloated. Then finally, you make sure you have some form of retention hook. And if you have all five of these things, you now basically have an MVP. Um, well, at least you have the
Chapitre 11 : Crafting the Minimum Viable Product
33:5133 minutes et 51 secondesMVP that you can give to Claude to have it turn it into the actual thing. You have like a scope. Okay. So, what I'm going to do now is I'm going to take everything that I just talked about and
33:5833 minutes et 58 secondesI'm just going to plug it into Claude code obviously in text. And then we're going to take the little fledgling app that I developed and then turn it into
34:0634 minutes et 6 secondessomething that actually abides by all all five of these core features. The very first thing I'm going to do is I'm going to head back to our little claw code window inside of anti-gravity. And
34:1434 minutes et 14 secondesthen I'm just going to go slash and then nit.
34:1834 minutes et 18 secondesNow, the reason why you go slash in it after you build out like a brief little uh demo of the app is basically this is
34:2534 minutes et 25 secondesa set of instructions that teaches claude every time it's initialized what the app is without it having to go through every single file on its own.
34:3434 minutes et 34 secondesAnd so for instance, what this just wrote, if I actually go down to the claude.md, which is the system file, okay, this is where it's actually storing all that information, is it's
34:4334 minutes et 43 secondessaying this file provides guidance to cloud code when working with code in this repository. Here is the architecture of our app. Here's the theme. Here's the state. Here's the
34:5134 minutes et 51 secondespath. Here's everything that you need in order to basically run it. And so the value there is you basically just eliminate um a couple of tokens so you're not actually spending as much
34:5934 minutes et 59 secondesmoney because most of the time you're build by token or your token usage consumes your plan. And then it also just knows where all the files are.
35:0535 minutes et 5 secondesOkay. So after you create your cloudmd, then you can just go back/clear. You'll see this little token meter on the right hand side will go back to basically
35:1335 minutes et 13 secondesnothing. And then we can continue with um you know actually having it design this app and make it better. And so what I'm going to do is I'm going to build the app according to the specifications
35:2135 minutes et 21 secondesthat I'm talking about. And then just to make my life way easier, instead of me writing all this stuff out just in the chat with my fingers, I'm just going to use my voice. And I'm using a voice
35:2935 minutes et 29 secondestranscription tool called Aqua right at the moment, which is where I can basically just talk into my mic and then it'll uh, you know, record a bunch of text. So, that's what just happened. And
35:3835 minutes et 38 secondesyou can see that it just pumped it right in there. What I'm going to do is I'm going to go back here and then I'm just going to discuss my app with Claude.
35:4435 minutes et 44 secondesHey, so I really like the app as it stands, but I'd like to level this up with an app design framework that uh you know, high-quality app devs and
35:5335 minutes et 53 secondesdesigners use where essentially every app that I build requires a core function, then a core loop, some accessory features, uh surface area
36:0136 minutes et 1 secondecheck to minimize the number of screens, and then some sort of retention hook. So the core function for this app is it needs to be able to create and then
36:0836 minutes et 8 secondestrack habits. The core loop for this app is basically every time a person uh creates a habit and then tracks it, they
36:1636 minutes et 16 secondesneed to be rewarded in some way. It needs to be visually stimulating. There needs to be some form of haptic feedback and then ideally there's some sort of sound like a like a chime or something.
36:2536 minutes et 25 secondesAlso, we need some form of challenge.
36:2736 minutes et 27 secondesSo, uh you know, if they're embarking on a 3-day habit challenge, let's say, which might occur immediately after onboarding, at the end of that 3-day
36:3436 minutes et 34 secondeschallenge, we also need to reward them for the fulfillment of their efforts.
36:3936 minutes et 39 secondesThe accessory features for this app are going to be something like uh logging.
36:4336 minutes et 43 secondesSo the user should be able to see all of their prior habits tracked, some sort of, you know, accountability thing so that they can look back and then maybe
36:5136 minutes et 51 secondessee a graph or a chart of just how consistent they've been. Um, and then ideally we need a way to create multiple types of habits, not just one. Uh, being
37:0037 minutesaware that, you know, a habit where you log it once per day is different from a volume based habit where you need to maybe do it three or four times a day.
37:0937 minutes et 9 secondesuh for surface area check just make sure that we don't have more than somewhere between five to seven screens in our app. We want it to be as simple as possible. And then in terms of retention
37:1837 minutes et 18 secondeshook, the thing that brings people back to the app, we want to create challenges for the user and basically have some sort of ongoing thing that checks in
37:2637 minutes et 26 secondeswith them via push notifications probably once a day or maybe a couple times a day. um just consistently knocking on their door, seeing whether
37:3437 minutes et 34 secondesor not they've done the habit, whether they're ready to start the habit or or hey, you know, don't forget about XYZ habit uh whose intention you said
37:4237 minutes et 42 secondesearlier today. Stuff like this just gets people coming back to our app and is ultimately responsible for a fair amount of our usage.
Chapitre 12 : Implementing App Features and Functionality
37:5037 minutes et 50 secondesOkay, so I just said a giant wall of text and because I did, it's not actually going to paste all of that text directly in like verbatim. You're not going to be able to see it. Instead,
37:5837 minutes et 58 secondesit's just going to say pasted text number one plus eight lines. So, what I'm going to do is I have this whole thing here. If I press enter, it'll now
38:0538 minutes et 5 secondespopulate. Um, and now that I've given it both the framework and also every little step in that graph, um, I'm going to have it actually implement and and add things to the app that we built earlier.
38:1538 minutes et 15 secondesJust that simple little tracker. One more thing I'm going to do is instead of doing all of the testing and demoing on my phone like I was doing earlier
38:2338 minutes et 23 secondesbecause the iPhone mirroring app just can't get any bigger. We're going to be doing this inside of Chrome directly.
38:2838 minutes et 28 secondesThe functionality is going to be the same, but this will just allow me to zoom way more in and then have you guys actually be able to see the thing. Um, but as a final check, I'm going to be
38:3538 minutes et 35 secondesgoing back through my phone using the Expo setup that we talked about earlier.
38:3938 minutes et 39 secondesAnd that's important just because if you can't actually physically, you know, play with the haptics, we can't hear the chime come out of the phone and stuff like that, you're not really getting the
38:4738 minutes et 47 secondeswhole experience. Okay. And this just thought for a minute and 29 seconds here. And then it got back to me saying, "Here's how I'd map your framework onto the current app." So, six screens in total. There'll be an onboarding.
38:5738 minutes et 57 secondesThere'll be uh first launch flow, which will pick three habits for you and then start a 3-day challenge. Today, which is a daily checklist, that's that core loop
39:0639 minutes et 6 secondesthat we talked about. history, which will be a calendargraph view of all of our past completions. And then some sort of consistency chart. A manage button,
39:1439 minutes et 14 secondeswhich is where you can do all of the stuff like adding, removing a habit, configuring the type, and so on and so forth. A challenge, which is where you can see the challenges that you're
39:2239 minutes et 22 secondescurrently enrolled in. Then finally, uh some little settings, which is where you can set your notification preferences, your theme, and so on and so forth. We'll do push notice uh on that. Okay.
39:3139 minutes et 31 secondesAnd then as things get better and better, you'll actually enhance the core loop. So, uh, you'll go haptics, then you'll do sound, and then you'll also go
39:4039 minutes et 40 secondesvisual as well with a little confetti particle burst on completion using this library called reanimated. You know, if I was a crazy crackedout appdev and I
39:4839 minutes et 48 secondeswas looking at this stuff, maybe I'd say, "No, I don't want you to use the Expo AV library. I want you to use this other library." Or, "I don't like reanimated. I like this other thing."
39:5539 minutes et 55 secondesOr, you know, confetti particle bursts are very CPU heavy. They're not like ideal, so let's not use them. But, we're just getting up and running at this point. So, I'm not going to be very opinionated in all the things that I
40:0440 minutes et 4 secondeswant us to do. I just want to show you guys proof of concept. You can get pretty far without uh you know without actually having to worry too much about every individual step. And so what it's
40:1140 minutes et 11 secondesdone here is it said, "Hey Nick, this is a substantial build. I want to tackle it in a bunch of phases." But just like I talked to you about earlier, uh you know, Claude is going to try and
40:1840 minutes et 18 secondesconserve both tokens and then also just like it's not going to try really hard or at least as hard as it realistically can in every scenario. So what I'll always do when it presents me a
40:2640 minutes et 26 secondessituation like this is I say, "No, I just want you to do the whole thing." So that's what I'm going to do here. I'd like us to do all of it, including phase
40:3440 minutes et 34 secondes1 through 4. Um, once done, open in Chrome, not Expo, so I can test locally.
40:4340 minutes et 43 secondesOkay. So, I'm just going to send that in and then we'll see where it goes. All right. And it spent something like 5 minutes thinking and then opened a couple of Google Chrome tabs. You'll
40:5140 minutes et 51 secondesfind that it'll do stuff like this just as part of its own internal testing loop from time to time. Um, we can expedite that as well by installing a specific
40:5840 minutes et 58 secondeslibrary which I'll run you guys through later as we get a little bit more complex with our app. But if I go to Google Chrome here, you'll see that we now have this tab open, localhost 8081.
41:0841 minutes et 8 secondesAnd so anytime you're designing or developing any sort of app, um, you will always usually open up a local server of some sort. Don't worry too much about it
41:1541 minutes et 15 secondeson like a technical POV. What we're doing is we're just like starting up a server to host our app on the back end.
41:2041 minutes et 20 secondesAnd so you can see if I just zoom in here to make it really easy that we we're actually already getting started with the app. Um it hasn't actually gone through and built the functionality yet.
41:2741 minutes et 27 secondesI think it's just like scaffolded a couple of pages. And obviously there are a couple of issues like the text here is invisible. But you know if I give this a click you can see that we we actually
41:3541 minutes et 35 secondeshave like the apps right here. So initially it's saying hey choose your habits uh exercise meditate and then drink water eight times a day. Then it's
41:4441 minutes et 44 secondesgoing to invite us into a 3-day challenge with that little button. Uh that's still screwed up. And then, okay, I'm just going to make this a little smaller.
41:5241 minutes et 52 secondesAnd then let me just make it look like an actual mobile app would realistically.
41:5741 minutes et 57 secondesYou can see that we now have sort of uh these three bottom tabs as well. Okay, so here's sort of the 3-day kickstart.
42:0642 minutes et 6 secondesOkay, we're 0 to 3 days right now. In order to drink water, every time I click this button, I don't think you guys can hear this yet, so let me move this. Let
42:1342 minutes et 13 secondesme just um uncheck the audio. You guys can now hear this little like chime/beeping noise. Ideally, I don't
42:2042 minutes et 20 secondesknow, like hopefully you can. Um, and then once you're done, once you make it to all eight, we now have one of three complete. Same thing with this meditate.
42:2742 minutes et 27 secondesSame thing with this exercise. But then you obviously have like that cute little chime with something saying all done for today. Okay. And then we can also uncheck, which is an important part of
42:3542 minutes et 35 secondesthe core loop as well. I'm sure you guys could see, but there are probably some situations in which like you can't, you know, you don't actually want to uh uh remain in a habit or maybe you locked it
42:4342 minutes et 43 secondesby mistake if that thumbmed or something, whatever. So, that's the today page. It looks pretty good. The history page over here is where you can see the long running streaks, which is
42:5042 minutes et 50 secondesnice. So, here's an activity graph. I don't actually have any activity cuz, you know, I just started with this stuff. Kind of curious if I go back here and I log my habits. Okay. And you can
43:0043 minutessee the activity graph has actually popped up there, which is quite nice.
43:0343 minutes et 3 secondesLooks like there's also a consistency chart which logs the consistency on a 7-day basis of how far you've gone with exercising, meditating, and let me just
43:1143 minutes et 11 secondestap through all of this so it gets to eight. And then also drinking water. And it looks like it's at 3%. And there's also a manage a habit button. And I'm
43:2043 minutes et 20 secondesjust uh highlighting this so I could see the text underneath. This is obviously a bug that we're going to have to fix, but you can see you can select a daily habit or a count style habit. I don't know. I want uh sleep habit, let's say. Okay.
43:3243 minutes et 32 secondesAnd this is going to be a daily habit.
43:3443 minutes et 34 secondesSleep before, I don't know, let's say 9:00 p.m. And then we'll do a daily reminder. Reminder at 9:00 a.m., it
43:4243 minutes et 42 secondeslooks like. Um, and then I'll press enter. And then now it looks like we have a sleep before 9:00 p.m. happen. If I go back here, we can we can also tap that, which is kind of cool. Awesome.
43:5243 minutes et 52 secondesSo, I mean, like this is more or less everything that I'm going for. In order to test the full 3-day kickstart, we're probably going to have to like accelerate that somewhat and build in uh
44:0044 minutesour own little like testing feature loop so we could see, you know, like this is one day, this is another day, this is another day. When all those 3 days hit, like what what sort of animation is
44:0844 minutes et 8 secondesgoing to appear, how are we going to track that um long term? But I would say this probably has most of the functionality gap that I want. Um obviously there are just a couple of
44:1644 minutes et 16 secondesissues like the fact that the text is the same color and uh the fact that this reminder here is like I can't change it.
44:2244 minutes et 22 secondesjust says daily at 9:00 a.m. So, what I'm going to do is I'm going to do the same thing I just did a moment ago where uh I just use a voice transcription tool
44:2944 minutes et 29 secondesto like talk Claude through my app. Uh it's just this time I'm going to change the you know make minor changes wherever appropriate. We're not actually building the whole thing now.
44:3844 minutes et 38 secondesExcellent job. This looks fantastic. The first thing I want to change is I need some sort of testing view for a developer so that I can modify the day
44:4744 minutes et 47 secondesof the challenge or at least trigger the event that occurs when we hit let's say 3 days out of the 3-day kickstart. Right now I just sort of have to trust that
44:5544 minutes et 55 secondesit's working, but I'd like to ideally really have it work. The second major issue is right now the font color that
45:0245 minutes et 2 secondesyou're using is the same as the background color for a lot of these icons. Uh the check mark icon for instance is invisible because of that. A
45:1045 minutes et 10 secondeslot of the text in the um history and then manage pages is also invisible. Um there's also no way right now to create your own challenge which is unfortunate.
45:1945 minutes et 19 secondesWe just sort of have to to go based off of the the pre-existing challenges. I'd like us to be able to do that. Also double check the stats. Right now I'm
45:2745 minutes et 27 secondesseeing exercise is 3% checked for instance after one day of doing it.
45:3245 minutes et 32 secondesMathematically it doesn't look like a 7-day challenge. It looks like a 30-day challenge, but uh on the consistency
45:3845 minutes et 38 secondesend, it's saying uh 7 days. Some of the uh text kind of rolls or wraps over on the
45:4645 minutes et 46 secondeshistory page. For instance, the current streak, the best streak, um just because the text itself is a little bit longer.
45:5245 minutes et 52 secondesUh you know, on mobile, it's most likely going to wrap. And then when it wraps, it's also left aligned, which I think just looks kind of weird. It doesn't look as good as it probably could.
46:0146 minutes et 1 secondeAnd then on the manage page, um I like all the icons. Everything there is really cute, but the um habit type selectors have the same font color problem. Same thing with the habit name.
46:1046 minutes et 10 secondesSo, I think that's just a widespread issue. Finally, at the very bottom, you have the ability to set a daily reminder, which I think is valuable, but uh we would want to uh be able to
46:2046 minutes et 20 secondescustomize the the date and time of the reminder. And also, ideally, we want to be able to specify different reminder times for different apps uh habits
46:2746 minutes et 27 secondesrather. Right now, we only have one reminder time, 9:00 a.m., across all of our apps. And that'll help with uh you know having the user have more control over when they want to be notified.
46:3746 minutes et 37 secondesAside from that, I liked our onboarding.
46:3946 minutes et 39 secondesUm I think we could do with one more screen that just very clearly explains how the app works. The core functionality is you can create an app
46:4746 minutes et 47 secondesand then you can track it. Uh you know hit milestones and kickstarts and then track your progress and then use push notifications so that you know if you
46:5546 minutes et 55 secondeswant to be reminded in a particular point in time to assist you uh you can.
46:5946 minutes et 59 secondesI'd say that's probably the 8020. Okay, with all that in mind, go through everything top to bottom, implement those changes, and then just open it up
47:0647 minutes et 6 secondesin another Chrome tab. I'll uh I'll test it. I'm now just going to dump that in and then cut to whenever it's done with all of its changes. Okay, after a couple
47:1447 minutes et 14 secondesof modifications, just making this more visible for you guys. You can see that it's opened a new tab. It's done those font color fixes, the stat card fixes,
47:2247 minutes et 22 secondesthe per habit reminders, custom challenge creation, and then it's also done some developer tool stuff for us, which is going to enable us to test the
47:2947 minutes et 29 secondesapp like I was talking about. So, just opening this back up in this window here. So, we could see we now have a better onboarding screen. So, here's how
47:3747 minutes et 37 secondesit works. We create habits, add daily check-ins or counted goals, like drink eight glasses of water, take challenges, push yourself with three, seven, or 30-day streaks, track progress to your
47:4547 minutes et 45 secondesstreaks, consistency charts, and activity history. Stay on track, set personalized reminders for each habit at the time that works for you. I see it's implemented a skip button. I think it
47:5347 minutes et 53 secondesdid this as a developer just for me. So, what I'll do here is I'll say read uh walk and then I don't know, exercise,
48:0048 minuteslet's say. Actually, why don't we do um healthy meal? That way, we test two different types. Now, we're going to start this 3-day challenge. Complete all
48:0848 minutes et 8 secondesyour habits for 3 days to earn your first achievement. Ready? Start the challenge. And now, we actually have this 3-day kickstart just as we did before. I'm realizing that I don't think
48:1648 minutes et 16 secondesyou guys could actually hear my uh chime before, but rest assured, this thing is chiming. Uh it's actually very delightful. And then when it goes all done for today, we we still have that
48:2448 minutes et 24 secondesconfetti, which is nice. And I can trigger it over and over and over again cuz I'm addicted to that paper, baby.
48:3048 minutes et 30 secondesAll right, so going to history here. Um it looks like we minimized the streak, the best, the 30-day average now sort of exists all in one line, which is quite
48:3848 minutes et 38 secondesnice. We also have obviously eliminated the font issues. And then we've uh implemented some brief tracking for per habit consistency. You can see here we
48:4548 minutes et 45 secondeshave 14% of the 7-day, which makes sense cuz we're done 17th. And there's a third 3% of 30-day as well. And this updates,
48:5348 minutes et 53 secondestoo, which is nice. Under manage, we still have those icons. I think we should probably add some functionality, not just to use these basic icons, but as you guys see, it's already better
49:0149 minutes et 1 secondethan like a, you know, over the the counter basically habit tracker app, despite the fact that visually it might not be as interesting. And then I'm actually just going to write morning
49:0949 minutes et 9 secondesrun. Okay. And then you can see there's also the ability to create a counted habit with I don't know five, let's say.
49:1749 minutes et 17 secondesCool. Both of these are pills for some reason. We have the challenges that they're connected to. But now on the right hand side, we have this little chime, which is cool. So I'm going to go
49:2549 minutes et 25 secondeschime and I'll say, "Hey, I want you to remind me every day at uh I don't know, let's just do 12 p.m. Let's say." Now, ideally, we'd have a little bit more
49:3449 minutes et 34 secondeslike feedback here to set uh that morning run. I'm noticing that we don't have that. So, I'm going to probably want to change that. Then down over here, we have simulate full challenge
49:4249 minutes et 42 secondescompletion, force complete challenge, reset onboarding, clear all data. So, this is basically like how we reset it from scratch. So, I'm just going to pretend that we're now done our 3-day
49:5049 minutes et 50 secondeskickstart challenge. Okay, cool. And we can see we have the beautiful crown, uh, little trophy, and then 3-day kickstart, 1 days completed, three habits track,
49:5849 minutes et 58 secondescontinue. And now it jumps us over to the create a new challenge section. So, I don't know, new challenge. And then we
50:0750 minutes et 7 secondeswant these habits. We're going to start the challenge. We're now basically doing another one. If I go back to today, you can see the new challenge is sort of up at the top. All right, that looks pretty
50:1550 minutes et 15 secondesreasonable. Um, I like this. I think I think there are just some weird issues with the um editing of that. Like some of the buttons and and check marks are
50:2250 minutes et 22 secondeskind of odd. And then I want this to be a little bit clear. So, what I think I'm going to do is I'm just going to do our last major change, you know, once we're done with this last major change. Sorry.
50:3150 minutes et 31 secondesI think that's the way the app's supposed to look. Um, I'm actually just going to like try try running it live then on my phone. I'll show you guys that and then after we're done with that, we'll uh actually push it out so
50:4050 minutes et 40 secondesthat you know I can use it uh a little bit broader and then we'll consistently add functionality to it like databases and so on and so forth to turn it into something that you can actually get on
50:4750 minutes et 47 secondesthe app store. So, taking a look at the app a third time, the new challenge section at the top of the today page looks to be indented a little weirdly.
50:5750 minutes et 57 secondesThere may be a div behind it. There may be an element or something like a box, but I can't see it. the background color might be the same. So, just fix that.
51:0551 minutes et 5 secondesUm, everything else on this page looks pretty good. I don't see any major issues. Oh, uh, some of the counted
51:1451 minutes et 14 secondeshabits look strange. For instance, healthy meal, which is uh one of the defaults, has a three out of three under
51:2351 minutes et 23 secondesit, but because it's underneath it and the icon to the left is centered, uh it looks strange compared to the rest of
51:3251 minutes et 32 secondesthe habits. So, I'd like you to to fix that. Just have a layout where everything's just on one line.
51:3851 minutes et 38 secondesHistory looks pretty good. I think the cards at the top of the page, the three for streak best and 7-day average, they're just a little tight vertically.
51:4851 minutes et 48 secondesSo, just add a little bit more vertical spacing between the emojis, the numbers, and then the U descriptor.
51:5451 minutes et 54 secondesAnd then on the manage page, uh add five more icons. So, we should have one more row. And then for the placeholder text, morning run, capitalize the R.
52:0652 minutes et 6 secondesAnd then for the reminders, right now there's no way to confirm the reminder.
52:1252 minutes et 12 secondesI think the user won't know whether or not the reminders are set for specific times unless we have a confirmation button. It also looks like the
52:2252 minutes et 22 secondesreminder div or section cuts off strangely. I think because the borders aren't rounded. Um just find a way to
52:3052 minutes et 30 secondescombine all of that so that it's seamless and fluid.
Chapitre 13 : Finalizing the App Design and Functionality
52:3352 minutes et 33 secondesAnd then I think the way that the new challenge edit section is right now is it's using
52:4152 minutes et 41 secondessome weird checkboxes. It almost looks like it's an unfinished product or maybe the styles haven't applied. So just double double click on that when you have a chance. And I'd say that's
52:5052 minutes et 50 secondesprobably the 8020. So I'm going to give it another couple minutes and then circle back and then we can work on the next step. I made a couple of additional minor adjustments. It generated 17 icons
52:5952 minutes et 59 secondesfor instance instead of 15 and I just wanted five per row. Spilled kind of weirdly. and then hit another one up here where the set button didn't do
53:0853 minutes et 8 secondesanything. But with all of that done now, I'm going to go back to the app and we can do a full run through basically by resetting the onboarding. Okay, so build
53:1653 minutes et 16 secondesbetter habits, get started. You can see we have the how it works section here, the continue. I'm going to go exercise, drink water, and then walk. And then I'm
53:2353 minutes et 23 secondesgoing to start that challenge. Just going to tap all of these so that they they hit the the numbers. So this is going to be eight. And that other two
53:3153 minutes et 31 secondesare going to be done. We also have a nice little border around this new challenge now which looks a lot sexier.
53:3653 minutes et 36 secondesUh this is now a little more vertically spaced out which is nice. And then we have those habits which are correct.
53:4153 minutes et 41 secondesUnder manage here we can see we have a bunch of new icons like coffee and stuff like that. So I don't know maybe we want coffee. And then let me just test this
53:4953 minutes et 49 secondesout. Looks like we have the reminder feature. Okay. Although the remind at is spilling over into two lines which is kind of annoying. So I may fix that. But anyway we could set whatever time we
53:5853 minutes et 58 secondeswant the reminder. And then when we set it, we can see that it's now been permanently fixed. It's now 5:00 a.m.
54:0354 minutes et 3 secondesbasically. And it looks like the UX is if I tap it again, the reminder turns off. And then if I tap it again, it turns on. So this one's reminder. Uh
54:1154 minutes et 11 secondesthis one here, I don't know, maybe you want like a 9:00 a.m. reminder. For this one here, maybe you want like a 12.
54:1654 minutes et 16 secondesOkay. So all of that is working functionally, which is quite nice. And then I'm just going to clear all data.
54:2254 minutes et 22 secondesWe're going to start from scratch and see if there's any change whatsoever.
54:2654 minutes et 26 secondesThat looks pretty good to me. And then I'm just going to go down here. Um, simulating the full challenge completion and then forcing the complete challenge.
54:3454 minutes et 34 secondesCool. Awesome. And as you can see here, they fleshed this out a little more.
54:3854 minutes et 38 secondesThis looked a little poor before, but now we have a 3day, 7-day, 14-day, 30-day, sleep 8 hours, healthy meal, and journal. Then we can name it something
54:4554 minutes et 45 secondesand then go ASDF is our current challenge. So, that looks great, but it's still on the computer. And in order to really know whether or not this app
54:5354 minutes et 53 secondesworks the way that I want it to work, what I'm going to do now is I'm going to run this on my phone. How do you do it on your phone? Well, we need to start one of those Expo servers and then actually going to, you know, do it on my
Chapitre 14 : Testing the App on Your Phone
55:0255 minutes et 2 secondesphone and then I'm going to like pay attention to haptic feedback and and stuff like that. So, what I'm going to say is start an expo server for this in
55:1055 minutes et 10 secondesa new terminal window. And it's important to say new terminal window because if it does so locally here, you'll find that you can't actually take
55:1655 minutes et 16 secondesthe QR code um sort of uh flow. So, what I'm going to do here, it looks like it misunderstood me here. or when I say
55:2355 minutes et 23 secondesexpo server, when I say expose server, I mean to run it on my phone um in a terminal so I could see the QR code. And
55:3255 minutes et 32 secondesonce I have that, just going to open up my camera here just to get it all nice and ready. Okay. And you can see it's right over here. So I'm just going to make this way bigger.
55:4255 minutes et 42 secondesAnd this is the same thing that we had earlier. So I can now just open it in Expo on my telephone.
55:5155 minutes et 51 secondesand then it'll go through that whole build process. Now, what you'll find is it's different to run something locally on your computer versus here. And so,
56:0056 minuteswhat's just occurred, just to show you guys here, be 100% uh real is there's a line down at the bottom that basically
56:0756 minutes et 7 secondesjust says uncaught in promise ID. And so, basically what that means is there's some issue with the server. And you can see when I tried reaching it, um we ran into a problem here as well where
56:1556 minutes et 15 secondesthere's some sort of issue with the get item or something like that. When this occurs, just copy over all of the error
56:2256 minutes et 22 secondesmessages. Okay, paste it into clot. So, I just did that. And now you're seeing it's saying the async storage v3 isn't compatible with expo go. We're going to
56:3156 minutes et 31 secondesdownload v2.2.0 or something like that. Okay. So, what I'm going to do now is I'm going to go back to our terminal window. Okay. And I'm just going to exit out of it. On a
56:3956 minutes et 39 secondesMac, you do so by holding control and pressing C. That's say exit. And then what you can do is you can always just like go up to see the last terminal command. So, I'm actually just going to
56:4756 minutes et 47 secondesclear everything and then I'll just go up to do the last terminal command. This should rerun uh the app for me. Okay.
56:5356 minutes et 53 secondesOkay. So, now what I'm going to do is I'm going to open up my camera again and then I'll do the same thing. So, now
57:0157 minutes et 1 secondeopening it in Expo Go. And as you can see here, there's no there's no errors um you know in the log. I actually have like the build better habits right here.
57:0957 minutes et 9 secondesSo, I'm just doing it on my phone. I'm going to open up the iPhone mirroring app, which um I believe I mentioned is unfortunately quite small. So, you'll
57:1757 minutes et 17 secondeshave to deal with said iPhone mirroring app being small, just kind of how it is.
57:2157 minutes et 21 secondesBut, as you can see, we actually have the app running locally. Um, which is quite nice. So, continue. And this is the same thing that we had before. It just looks like some of these icons are
57:2957 minutes et 29 secondesa little bit cut off at the head. So, kind of odd. I'm just going to make a note of that here before I forget. Let me just say great stuff. But the icons
57:3657 minutes et 36 secondesare cut off around halfway through vertically. It's like the heads are cut off or something. Okay, I'm
57:4457 minutes et 44 secondesgoing to go back here, click continue, and yeah, we see the same issue with all of the icons. So, it's probably just a persistent problem. It also looks like there's not a lot of visual space up
57:5257 minutes et 52 secondestop. For those of you guys that can't see, the uh time is basically immediately overlaying the the date.
57:5957 minutes et 59 secondesAlso, there's no vertical space. Um, add some sort of padding up at the top to accommodate for the fact that the iPhone has its own little bar.
58:1158 minutes et 11 secondesuh the black what's this one called? The black middle window and then the um battery time etc.
58:2158 minutes et 21 secondesAnd I'm just going to keep all that here as I continue going through the app.
58:2458 minutes et 24 secondesAwesome. We're getting some great notifications and like awesome sounds as this thing comes in, which is beautiful. Ooh, and I really like that animation.
58:3158 minutes et 31 secondesThat's nice. Then we're going to the history. We can see the dates and times are all good. And basically what we're doing is we're just retesting this. It's just redoing it on my phone.
58:4158 minutes et 41 secondesCool. So, we have an example habit. And now, this is really cool. This didn't occur locally, obviously, because we didn't have push. But, um, now you can see it's saying, "Xigo would like to
58:4958 minutes et 49 secondessend you notice." So, we're not actually going to get the notification prompt until we click that little button, which is awesome. Uh, which means it's going to be lower friction on the user POV.
58:5958 minutes et 59 secondesAnd then, you know, naturally, most people are going to want to set some sort of reminder at some point. So, we'll allow it now. And now we can go through and say, hey, I want to set it
59:0759 minutes et 7 secondesfor 12, which is pretty great. Okay. And uh yeah, now I'm going to say force complete challenge. Just make sure that works. That's great. One day completed,
59:1459 minutes et 14 secondesthree habits tracked. Awesome. And now we could set sort of our own great new challenge, healthy meal, and
59:2259 minutes et 22 secondesthen start challenge. Awesome. And the final test through run is it's one thing to do it here like in front of you guys.
59:2959 minutes et 29 secondesIt's another thing to do it on the phone itself. And that's important because if you think about it, the way that you use a phone, it's a little bit different from the way that you use a computer. On
59:3759 minutes et 37 secondesa computer, you have a mouse and so the mouse can sort of equally touch everything on the page. But me as a user, I'm going to be mostly using my thumb. So, it's actually important that
59:4559 minutes et 45 secondesmost of the major functionality is sort of within thumb's reach. There are other minor UX things as well to check like you want to you want to make sure that the thing scrolls the way that you
59:5359 minutes et 53 secondesexpect it to. uh you know there's additional functionality like long press on things and uh you know this is stuff that like you can't just get if you're
1:00:011 heure et 1 secondedoing things entirely through a code on your computer. You sort of have to play around with it a bit. So I'm just going to play around with the app a bit and I'll make any additional minor changes I
1:00:081 heure et 8 secondeshave to. I really like this. I would say this is the 8020 and it's already significantly better habit tracking app than most of what is currently on the market. And it's pretty funny because I
1:00:171 heure et 17 secondesthink I managed to do all this for maybe 50% of my cla uh for this uh session which is like every couple of hours. So, that's pretty crazy, right? It's a $20 a
1:00:261 heure et 26 secondesmonth subscription. I was able to build a better app than 90% of what is currently available on the app store and I was able to do it, you know, entirely myself. Just going to close out of this.
1:00:341 heure et 34 secondesI'm going to push these changes, do another double check, and then we're done with our first version of the app.
Chapitre 15 : App Development Insights
1:00:401 heure et 40 secondesOkay, once you've gotten the app to a place where you like it, um, there are a couple things that you should do. The first thing you should do is you should update that cloud.md again. And the
1:00:481 heure et 48 secondesreason why is cuz this app is no longer just like that that beta version. And this is, you know, like a full-fledged MVP. It has a lot of functionality in it. And the next time you change things
1:00:561 heure et 56 secondesor edit it, this cloud MD, which provides all of like the base information and is immediately loaded into every conversation that you have with Claude, um, should describe like all of the the additional functionality.
1:01:071 heure, 1 minute et 7 secondesThe second thing you should do is you should push this to GitHub. For those of you guys that don't know, GitHub is a version control platform, which is basically a fancy way of saying it's
1:01:161 heure, 1 minute et 16 secondeslike a place for you to store your code on the internet. And the reason why it's valuable, at least for app developers, which I guess you are now attempting to
1:01:241 heure, 1 minute et 24 secondesbecome a part of said class, um, is because it doesn't just store the code, it also stores any changes that you've made to the code. And turns out that's pretty valuable because when you have
1:01:321 heure, 1 minute et 32 secondesAI, you know, doing whatever the heck it wants in your codebase, if you don't have some sort of like accountable way to revert back to the previous instance, let's say you have an awesome thing
1:01:401 heure, 1 minute et 40 secondesgoing, you make a couple changes, the app breaks, and you're like, "What the hell? How do I fix this?" If you don't have an easy way just to roll that back and then share those rolled back updates
1:01:471 heure, 1 minute et 47 secondeswith other developers in the team, you know, you can you can wind up in in quite a pickle. And so if you don't already have a G GitHub account, it's pretty easy to do. All you need to do is
1:01:551 heure, 1 minute et 55 secondesjust enter your email address right over here. So I'm going to assume that you've done so. You've signed up. They might ask for your phone number, maybe your email address, uh double verification or
1:02:031 heure, 2 minutes et 3 secondessomething like that. They tend to be pretty secure. And then once you have it, um you can literally just go right over here and then just say, "Great, create a GitHub repo for this."
1:02:131 heure, 2 minutes et 13 secondesand uh as well as a readme then push. Now, if you're not logged in to GitHub here, it'll ask you to
1:02:211 heure, 2 minutes et 21 secondesbasically do authentication and then connect. That'll open up a little page for you and then it'll like, you know, have you relog in again. Um once you're
1:02:281 heure, 2 minutes et 28 secondesdone, what this will do is this will just push this to that that database online, that sort of version controlled resource. Okay, so it's doing it right
1:02:361 heure, 2 minutes et 36 secondesover here. Uh and you can see it actually called it example project, and I'm realizing I don't actually want it to be called example project. I just created that for you guys. Um, rename it
1:02:441 heure, 2 minutes et 44 secondesto habit tracker and uh, rename this folder as well. And
1:02:511 heure, 2 minutes et 51 secondesthat way uh, you know, we'll actually know what the heck's going on. Always important to name things. Once done, you'll have the same thing um, inside of the uh, a folder on the lefth hand side.
1:03:001 heure et 3 minutesAnd if you don't like this example project, like I don't, I can already tell that's starting to get annoying.
1:03:041 heure, 3 minutes et 4 secondesI'm just going to open folder and I'll just go directly to habit tracker and then don't save. And now you can see this uh window is opened. It will have
1:03:121 heure, 3 minutes et 12 secondesreverted our session though. So just keep that in mind. You won't be in the same session. Then if you go to
1:03:201 heure, 3 minutes et 20 secondesum your GitHub, I'm just going to go habit tracker. See if I could find it. I see one that's capitalized here. That's probably it. Yep, that's one from 2 minutes ago. You'll actually see all the
1:03:281 heure, 3 minutes et 28 secondescode written on the page. So just making this really clear to you. Um, Claude always likes adding itself as uh, you know, one of the the collaborators on any project now, which I find hilarious.
1:03:391 heure, 3 minutes et 39 secondesSo, it's two people and Nick Sarah. So, it's GitHub, it's Claude, and it's Nick.
1:03:431 heure, 3 minutes et 43 secondesNick's doing the heavy lifting, though, trust me. Um, and scrolling down, you can see that 2 minutes ago, we actually added all these these changes alongside our habit tracker app. So, it's still
1:03:521 heure, 3 minutes et 52 secondescalling an example project, which is kind of annoying. You can click here and then um, edit that at any point in time.
1:03:571 heure, 3 minutes et 57 secondesYou know, a couple additional prompts and it probably would have done so just fine. So, I'm just going to click commit. And by doing so, what we have now is we have like the updated version
1:04:051 heure, 4 minutes et 5 secondesof this app. And uh it actually just stored that change directly to this file readme. And you know, don't worry too much about all the tiny little specifics here like the description of the change, the time of the change, specific files.
1:04:151 heure, 4 minutes et 15 secondesBut just know that you basically now have this online. The value there is you can share it with your team. And then as mentioned, if there are any issues, you can roll it back at any point in time,
1:04:221 heure, 4 minutes et 22 secondeswhich is quite cool. Okay, so what do we have now? We have an app that is running and capable of running locally on my
1:04:291 heure, 4 minutes et 29 secondescomputer. It's also capable of running on my phone using Expo. Okay, we can't actually run it on our phone like on the
1:04:371 heure, 4 minutes et 37 secondesapp store yet until we push it out and actually get it running. So, just keep that in mind. Now, the issue with this is all of the data is currently stored on our phones and our computers. So,
1:04:451 heure, 4 minutes et 45 secondeswhen I run it on my computer, for instance, as you guys saw a moment ago, um you know, it's like storing that data directly on my computer. If I sent the app to somebody else, it wouldn't be able to use that app.
1:04:551 heure, 4 minutes et 55 secondesum on my phone, you know, it's running locally on my phone in so far that all the data that it's creating, the preferences of the apps and the habits and stuff like that that I'm generating, they're actually just stored on my phone
1:05:031 heure, 5 minutes et 3 secondesin in like a little memory feature. We have to do if we really want to truly like internationalize and and and allow our app to be used by a bunch of other people and then also allow like
Chapitre 16 : Transitioning to Cloud Storage
1:05:121 heure, 5 minutes et 12 secondespersistent storage that doesn't depend on the device so that if I download it on my phone and on my computer, we're both going to be like pulling the same data is I need some sort of database.
1:05:201 heure, 5 minutes et 20 secondesAnd a database, for anybody unaware, is just very similar to your hard drive. It's just being hosted elsewhere.
1:05:261 heure, 5 minutes et 26 secondesBecause it's being hosted elsewhere, you need a way to talk to it. And so that's where languages like SQL and a bunch of other programming jargon and stuff like that come in handy. What's really cool
1:05:341 heure, 5 minutes et 34 secondesis with AI and a couple of simple solutions, you can now communicate with these databases and set everything up almost completely autonomously. back in
1:05:421 heure, 5 minutes et 42 secondesthe day when I was starting uh developing apps and I developed my first one for um um 1 second copy which is a company that I ran we scaled to over
1:05:491 heure, 5 minutes et 49 secondes90,000 bucks a month um basically AI generating articles for people designing the simplest thing on planet earth much simpler than what I just showed you here
1:05:571 heure, 5 minutes et 57 secondestook me like 3 weeks because a good two and a half of it was me just fiddling with the database setting up my SQL schema and all that now we can do so in
1:06:051 heure, 6 minutes et 5 secondesliterally like 30 seconds and that's what I'm going to show you guys next taking this habit tracker and then adding uh database functionality to the back end. And once we're done with that,
1:06:131 heure, 6 minutes et 13 secondesI'll weave in a little bit of AI functionality just to really complete the circle. And then we'll actually push this puppy out to the app store as well as go over some other apps that you
1:06:211 heure, 6 minutes et 21 secondescould build that are increasingly exciting. All right, so now that we have the app working, right, we verified the core functionality. It's time to take it
Chapitre 17 : Database Integration with Supabase
1:06:281 heure, 6 minutes et 28 secondesfrom local storage, aka storing all of the data on the same device that we are building on to cloud storage, which in
1:06:351 heure, 6 minutes et 35 secondesour case is going to be storing the data on a in a database. And the database that we're going to use in particular for this app is called Superbase. Now, I
1:06:431 heure, 6 minutes et 43 secondeswant you guys to know that there's like a million different databases you can use. And my stack here is rather opinionated. Um, I just use the stack because I have built many apps on the
1:06:521 heure, 6 minutes et 52 secondesstack myself. And typically what goes on when you end up building a lot of apps is you just kind of arrive at one specific stack or set of tools that works pretty well out of the box and
1:07:001 heure et 7 minutesthen you just stick with it. And then it's a self-fulfilling prophecy, right?
1:07:031 heure, 7 minutes et 3 secondesIt's not necessarily that it's the best stack ever, but you just know how to use it. So to you it's easier. And then you get, you know, you carve out the little rivers and paths of uh uh the stack over
1:07:111 heure, 7 minutes et 11 secondesand over and over and over again. And then you end up just not really wanting to use anything else. So feel free to apply the same idea here that I'm about to show you guys to like databases in
1:07:201 heure, 7 minutes et 20 secondesgeneral. You don't have to stick with the one that I'm going to show you guys how to use, but uh I really like the one that I'm showing you how to use and a lot of other vibe coders and app developers and stuff like that nowadays
1:07:281 heure, 7 minutes et 28 secondesmake use of it as well. Okay, so just zooming in a bit here. Um the specific platform I'm going to use is called Superbase. Now, instead of storing everything, you know, inside of the
1:07:371 heure, 7 minutes et 37 secondeslocal storage or whatever. When you use a database, there's sort of two things that go on. And I don't know where I put my pen. So, give me a sec. I'm going to go find it. Okay. I have no idea why
1:07:441 heure, 7 minutes et 44 secondesthat was in my kitchen, but it was. Uh, so basically what we have right now, if you think about it logically, is we have um, you know, sort of our app over here
1:07:521 heure, 7 minutes et 52 secondeson the left hand side. And basically what the app does at the moment is it communicates, okay, with whatever the device is. And so in our case, this
1:08:021 heure, 8 minutes et 2 secondesdevice, you know, if I'm running it locally here on my computer, it'll be on my computer. Um, or, you know, if I'm running it on my phone, it'll be on my
1:08:091 heure, 8 minutes et 9 secondesphone. And basically, just like, you know, you have a little hard disk with like memory and stuff like that or a little USB key or something. All of this data is partitioned and then you can you
1:08:171 heure, 8 minutes et 17 secondescan send and requests and the computer keeps track of which area that the the data is and you know, it's sort of seamless. However, this is just local storage. What we need to do now is we
1:08:261 heure, 8 minutes et 26 secondesneed to go one step further. And basically what's going to happen is our app, okay, is going to send and receive data to our device. And then our device is also going to send and receive data
1:08:341 heure, 8 minutes et 34 secondesto a database, which uh in my case I'm just going to call cloud storage. And this is going to be like our our DB. And
1:08:421 heure, 8 minutes et 42 secondesour DB here is going to be called superbase.
1:08:451 heure, 8 minutes et 45 secondesNow the issue with a structure like this is the second that you add that additional layer, you need to tie the
1:08:521 heure, 8 minutes et 52 secondesspecific user of the app with a specific table or a specific um section of the database. And so it's not enough just to
1:08:591 heure, 8 minutes et 59 secondesadd a database on its own. What I mean by this is you can't just add the database and then have everything work the same. You also need to add some sort of user functionality. So the database
1:09:081 heure, 9 minutes et 8 secondesneeds to be able to pull records for a specific user. Like they need to know that it's Nick's data for instance versus another user's data. And so actually what we're going to do on top
1:09:161 heure, 9 minutes et 16 secondesof our app is we're also going to add um basically some sort of like login functionality and there's going to be like a little screen here which has like you know username and password. Um and
1:09:251 heure, 9 minutes et 25 secondesthen what we can do is you know our app we can use to login. That login data is then going to go to our database pull and basically verify that like okay that
1:09:321 heure, 9 minutes et 32 secondesuser is the right user. Um and then we can use the app as usual shuttling data to and from our device and then ultimately our our cloud storage for you
1:09:401 heure, 9 minutes et 40 secondesknow updates and stuff like that. And a structure like this is typically the most efficient simply because you get to take advantage of like local ondevice caching which allows your data to load
1:09:481 heure, 9 minutes et 48 secondesinstantly. Um but then also uh you know like updating from the database periodically. And so this is more or less what it is that uh we're going to build. And the good news is you don't
1:09:561 heure, 9 minutes et 56 secondesactually have to know anything about databases or authentication or anything like that anymore. You could just have Claude do most of it for you assuming that you're using a provider that
1:10:031 heure, 10 minutes et 3 secondeshandles it all like Superbase. In my case, Superbase handles both the a and the login. So, what I'm going to say is I'd like to add a database to this
1:10:121 heure, 10 minutes et 12 secondesproject. And uh I'm just going to use my voice transcription tool. In addition to a database, I also want local caching so the user has very immediate and snappy
1:10:211 heure, 10 minutes et 21 secondesexperience when they use the app. Uh we're going to be using Superbase as our app. And in addition, we're going to need to set up user authentication so that you know which user is accessing
Chapitre 18 : Setting Up User Authentication
1:10:301 heure, 10 minutes et 30 secondeswhich data. Help me through this process.
1:10:341 heure, 10 minutes et 34 secondesAnd as you can see, you can just ask the model for help. It's not that big of a deal. Um, but basically what it's going to do now is it's going to change our database which is likely currently
1:10:421 heure, 10 minutes et 42 secondesstored somewhere I imagine inside of our apps folder or maybe uh I don't know one of these folders here. Uh, and then it's going to replace that specific thing
1:10:491 heure, 10 minutes et 49 secondeswith like an API call which is basically a request to uh a service outside of our app. And because we're now extending beyond the bounds of our initial device
1:10:581 heure, 10 minutes et 58 secondesuh you know the the the system needs to look a little bit different as well. We also need some uh cool features like security features to ensure uh that you
1:11:051 heure, 11 minutes et 5 secondesknow other people don't use my username let's say to log in and access my data unless that's something that you know I uh I specifically allow them to do you
1:11:131 heure, 11 minutes et 13 secondesknow bake it in or give them my my credentials and so we don't need to worry too much about knowing sort of all the different ways that you can do things um just ask claude for help
1:11:211 heure, 11 minutes et 21 secondesreview it make sure it makes sense for what it is that you're trying to do assuming that it does you can move forward here's what claude just told me how to do the proposed architecture of
1:11:281 heure, 11 minutes et 28 secondessuperbase for o which is email password and oath Those of you guys that don't know, OOTH just means being able to log in with a social provider like let's say Google. So I could do a one-click sign
1:11:361 heure, 11 minutes et 36 secondesin with Google and then I could sign into my app that'll identify and authenticate me. Now then it's going to say Postgres database for habits, completions, and challenges. That's just
1:11:451 heure, 11 minutes et 45 secondesbuilt into Superbase. You don't need to worry about it. We have local first caching, which is what I was alluding to. So we're going to keep async storage as the immediate readr layer so the app
1:11:531 heure, 11 minutes et 53 secondesfeels instant. The idea is we want to be you want it to be really snappy. If you have to like write read and write to a database every single time you make a change, usually there's like a little bit of a lag there. It might be a few
1:12:011 heure, 12 minutes et 1 secondeseconds, could be, you know, just milliseconds, but it's still like a little bit of a delayed experience for the user. And I also don't want to add any load time initially. So what's going
1:12:091 heure, 12 minutes et 9 secondesto happen is we're going to cache all the data locally. So we're still going to have that layer. We're just going to add the database and periodically sync.
1:12:151 heure, 12 minutes et 15 secondesOkay. So then we're going to replace the current onboarding only gate screen with a superbase authentication screen that involves sign up and sign in. And then we're going to onboard uh for new users
1:12:231 heure, 12 minutes et 23 secondesas well. Now, it's also asking for preference on O methods. Email and password is simplest to start, but Superbase also supports Google, Apple,
1:12:311 heure, 12 minutes et 31 secondesGitHub, OOTH out of the box. Then, it also uh is going to run me through the the process of installing Superbase. So, I'm going to say I don't yet have Superbase set up, but I'll do that now.
1:12:391 heure, 12 minutes et 39 secondesLet's go with email and password. Work on everything that you can uh up until that point. Cool. And what's really interesting here is, you know, I'm
1:12:481 heure, 12 minutes et 48 secondesacknowledging that I don't have the step that it asked me to have. Instead, I'm saying I'm going to do that as you do the rest of your work. And so, I'm just parallelizing. I'm batching a little
1:12:561 heure, 12 minutes et 56 secondesbit. So, how do we actually go about this process? Uh, it's pretty straightforward. So, I'm just going to open up my little habit tracker app here. And then, I'm going to go Superbase. Okay, let me just make this
1:13:041 heure, 13 minutes et 4 secondesbig. And as you can see, Superbase here is, uh, just like any other app, you little login screen and stuff like that.
1:13:091 heure, 13 minutes et 9 secondesIn my case, I'm already logged in. Now, what you have to do if you want to log in is just, you know, create an account.
1:13:141 heure, 13 minutes et 14 secondesIt's totally free. You can then start a project. Um, after which you'll have a page that looks like this. So, I'm going to click the start a project page. Okay.
Chapitre 19 : Implementing AI Features
1:13:211 heure, 13 minutes et 21 secondesAnd I just deleted all my projects here so you guys could see them for yourself.
1:13:241 heure, 13 minutes et 24 secondesI think what I'll do is let's go to Nick J. Wellsorg. And here you can set a project name, which I'm just going to call habit tracker app. And then you can
1:13:321 heure, 13 minutes et 32 secondesalso do a database uh password right over here. So I'm just going to add my own little database password. And uh it looks like it's saying my password must be harder to guess.
1:13:411 heure, 13 minutes et 41 secondesSo there you go. Just going to make it a little bit longer. Okay. Okay, so now that we have the database password and then the region, uh, we can enable the
1:13:491 heure, 13 minutes et 49 secondesdata API automatically expose new tables. And then there's one more thing you have to do down over here where it says enable automatic RLS. Just check that button. That's pretty important.
1:13:581 heure, 13 minutes et 58 secondesAnd then you just give it a click just like that. And now uh it's basically going to go through the process of creating the database for us. And once it creates the database, we'll have a bunch of information that we can send
1:14:061 heure, 14 minutes et 6 secondesback to Claude. So that's what we're doing right now. I'm just going to save this. And it looks like it's setting it up somewhere in Oregon, which is nice.
1:14:111 heure, 14 minutes et 11 secondesthe location of your database is is pretty important uh because the further away it is from where users are going to be using your app, the uh more lag uh
1:14:181 heure, 14 minutes et 18 secondesinvolved. Okay, great. So, as we see here, it's actually already doing the work in the back end, which is quite nice. So, it's installing dependencies and stuff like that. All we really have
1:14:261 heure, 14 minutes et 26 secondesto do here is just wait for this to finish and then ask us for specific things from Superbase and then uh we can actually go through and like give it like our password and our API key and stuff like that. Okay, we're 3 minutes in now. The status has changed slightly.
1:14:361 heure, 14 minutes et 36 secondesIt's basically going through all of the database steps. You guys can't see all of them because of my fat head. So, let me make some more room. Um, the database
1:14:431 heure, 14 minutes et 43 secondesis healthy. Postg rest is healthy. Off is healthy. Realtime is healthy. Storage is healthy. And then finally, the edge functions are healthy. No, you don't need to know what any of this stuff
1:14:511 heure, 14 minutes et 51 secondesmeans. It's all good. Uh, but basically, they're just telling us that the database is now set up, and we can actually proceed with the rest of the steps. You'll see the first thing it's doing is it's giving us the ability to
1:14:591 heure, 14 minutes et 59 secondescopy the project URL, publishable key, direct connection string, then some CLI setup commands. If you don't know what any of this stuff is, uh, Claude can walk you through it. But basically,
1:15:071 heure, 15 minutes et 7 secondesthese are all just things that are required for it to modify or manage your Superbase for you without you actually having to like click in at all these
1:15:141 heure, 15 minutes et 14 secondestables. So, going back to Claude Code, you can see that it's now saying that it's it's done. It's given us all this information and then your next steps are
1:15:211 heure, 15 minutes et 21 secondesto create a superbase project at whatever. Um, so, okay, I have the Superbase project ready to go.
1:15:311 heure, 15 minutes et 31 secondesUh, I'm just going to paste in all this information. So I'm going to copy the project URL. Then I'm going to copy the publishable key and I'm also going to
1:15:391 heure, 15 minutes et 39 secondescopy the direct connection string. Then finally I'll copy the CLI setup commands as well. So this is giving it literally everything that it needs in order to
1:15:471 heure, 15 minutes et 47 secondesmanage as much of this process on its own as it can. And the reason why is because um you know as mentioned cloud a lot of the time is trained off of old
1:15:551 heure, 15 minutes et 55 secondesdata where you know a human being had to actually manually do things like run the schema. A lot of the time you can just give it full access to superbase to have it do it for you. um not to mention like
1:16:031 heure, 16 minutes et 3 secondesother platforms as well. So that's what we're doing here. We're basically saying, "Hey man, here's all of the stuff you need in order to do it for me." And now it's going through and what
1:16:101 heure, 16 minutes et 10 secondesit'll do is it'll set up that schema um using, you know, this SQL editor. And I'll show you guys what that looks like after. But basically, this is just how you set up the database. This is how you
1:16:181 heure, 16 minutes et 18 secondesset up the rows, the columns, the headers. It's how you know that you're going to have like a field called data type, let's say, and that's going to be
1:16:251 heure, 16 minutes et 25 secondeslike habit, uh data type name or whatever, and that's going to be like, I don't know, morning meditation or something.
1:16:321 heure, 16 minutes et 32 secondesOkay, so going back over here, it's saying that we need to do a Superbase login step interactively. Okay, so I'm going to say run login script all
1:16:401 heure, 16 minutes et 40 secondesauthenticate. Now, if it gives you an error like it just did to me, basically saying you can't do it within your non-TY environment. That's just a byproduct of the current terminal type
1:16:481 heure, 16 minutes et 48 secondesthat we have, you can also just open up a new terminal like I did here and then just run that same command, superbase login. What it's going to do is it's
1:16:551 heure, 16 minutes et 55 secondesgoing to give you a login link. So then you can copy that and then what you have is you have a little copy paste window.
1:17:021 heure, 17 minutes et 2 secondesSo you can copy it, go back to the terminal, just paste it in. So as I just did now we've authenticated. We're basically in uh Superbase. So now I can
1:17:091 heure, 17 minutes et 9 secondesgo back here and I can say okay, logged in. And now because we share access across the entire um basically across
1:17:171 heure, 17 minutes et 17 secondesall of the terminal instances of my computer, we can now download and kind of proceed with that. So now it's installing it and now it's applying the
1:17:241 heure, 17 minutes et 24 secondesschema. For those of you guys that are curious, what does the schema actually look like? Well, the schema is just like the the the the the set of tables uh in
1:17:321 heure, 17 minutes et 32 secondesour database. So, you can see here that we now basically have three. We have challenges. Challenges contain an ID and a user ID, a name, habit ID, start date,
1:17:411 heure, 17 minutes et 41 secondesduration date is complete, reward claimed. Okay. And then if we go down, we also have completions. Then we have habits. And actually looks like we have a fourth, which is profiles. Profiles is
1:17:491 heure, 17 minutes et 49 secondeswhere we're going to store some of that user data. So what's really interesting uh just historically speaking is like you used to have to come up with all this stuff and uh you used to also have
1:17:571 heure, 17 minutes et 57 secondeslike really tight associations between things like the user ids uh in each table so that you knew that the habits that belong to a specific user ID um you
1:18:051 heure, 18 minutes et 5 secondesknow connected to the specific completions and challenges and you used to have to run all this like almost like math every single time that you set up one of these apps. Uh this just does it
1:18:131 heure, 18 minutes et 13 secondesall basically entirely automatically for you just based off of what is logical.
1:18:161 heure, 18 minutes et 16 secondesLike it's logical for instance that you know your habits and your challenges need a name. Uh you know it's logical that they need an emoji because that's just how our app's built. Logical that
1:18:251 heure, 18 minutes et 25 secondesthey might have a type between two or three different types, right? These are all things that just like standardize and operationalize the data within our app. It's just now this is the back end
1:18:321 heure, 18 minutes et 32 secondesand uh you know we're doing this on like a a cloud database as opposed to locally. So now that we have all this stuff, all we have to do is just disable email confirmation. So I'm going to go
1:18:401 heure, 18 minutes et 40 secondesto the superbase dashboard and uh right over here it'll basically say confirm email and I'll say no. And the reason why we're doing this is because if not,
1:18:481 heure, 18 minutes et 48 secondesthe users have to go through an additional step in order to log in, which is like they'll create an account and then they'll say, "Okay, go confirm your email." And then we'll have to go
1:18:561 heure, 18 minutes et 56 secondesback and forth that. So, this is just eliminating the step to make it a lot easier for us. Okay, great. Let's test the full flow. And with all that said,
1:19:041 heure, 19 minutes et 4 secondeslet me show you guys what it actually looks like now. Now, I'm going to run this locally on my computer and then I'm going to do the app stuff that we were doing earlier where, you know, I test it
1:19:111 heure, 19 minutes et 11 secondesvia Expo and then ultimately I test it on my phone. And you can see it's finding a couple of crashes before it launches. This sort of thing is pretty normal. It'll selfheal and self anneal
1:19:191 heure, 19 minutes et 19 secondesas needed. So we'll just run this a couple of times until we get the onboarding.
1:19:231 heure, 19 minutes et 23 secondesOkay. And now if I make this smaller so it's more like a mobile app. And then zoom in. I think 150 is probably pretty good. Just do that. Make it a little bit bigger.
1:19:331 heure, 19 minutes et 33 secondesYou can now see that we have the whole signup flow. So I'm going to go sign up down at the bottom. Just delete this other one here. And then I'm just going to add in my email address.
1:19:441 heure, 19 minutes et 44 secondesAnd then we'll just add in some silly password and click sign up. So what happens after we sign up? Well, obviously we need to go to onboarding,
1:19:511 heure, 19 minutes et 51 secondesright? So now we're saying build better habits. So I'm going to get started. And as you can see, we've now basically just wrapped the app in a login flow. It's the same core functionality I had
1:19:591 heure, 19 minutes et 59 secondesbefore. It's just now it's like wrapped where in order to enter you have a login flow and then the back end you have the database. So I'm going to click continue and I'm going to say I want to read, I
1:20:071 heure, 20 minutes et 7 secondeswant to walk, I want to do journals. And then I'm going to continue start challenge. Uh, and now maybe I tap each of these three, you know, we have this cool little thing. We have our history.
1:20:151 heure, 20 minutes et 15 secondesThe history is actually being pulled from our database now. And then we can also manage it. I want to add something new. Okay. And then maybe uh I don't know, I want to set a set a reminder
1:20:241 heure, 20 minutes et 24 secondestime like I did before. Okay. So, obviously we can't see sort of the way that the backend works here because we're just doing this locally in our computer, right? If you actually want to
1:20:321 heure, 20 minutes et 32 secondessee the way that this is, you have to go to uh the database and then you can actually see like specific tables. So, let me show you what that looks like.
1:20:381 heure, 20 minutes et 38 secondesOkay. The first thing is if you go to authentication on the lefth hand side and then click on users, you can actually see the uh data that we just created a moment ago. So I just created
1:20:471 heure, 20 minutes et 47 secondesan account using my email address. You can see that we were just supplied a UID or a user ID. There are a couple of additional fields here which just
1:20:551 heure, 20 minutes et 55 secondescreates for you like phone provider type uh and stuff like that. And then also under provider there's email. Uh as talked about you guys can also sign in using Google and stuff like that. Just
1:21:031 heure, 21 minutes et 3 secondesask cloud to do that for you. You can also add a user locally here. So, this is sort of like your admin, you know, dashboard, at least for now. Um, we can
1:21:111 heure, 21 minutes et 11 secondesactually just set up a new user. Let's say you have somebody being like, "Hey, I'm having an issue creating an account.
1:21:151 heure, 21 minutes et 15 secondesCan you create an account for me?" You can actually do it entirely. You just create a new user. You put their email address and password, autoconfirm them, and then just give that information to them. They'll be able to log in. So, all
1:21:241 heure, 21 minutes et 24 secondesthe stuff that we just did in our app, like it is actually showing up here on a website essentially. Um, sort of verifying the fact that our app is now connected, but it's not just connected
1:21:331 heure, 21 minutes et 33 secondesto our website, right? As I showed you guys earlier, I don't know why I'm not using my pen for this. Um, we're also communicating locally with our uh, you
1:21:411 heure, 21 minutes et 41 secondesknow, with our device. So, that's why I'm not using it cuz my arrows are so much more uh, uh, janky. So, you know,
1:21:481 heure, 21 minutes et 48 secondesthis is our app. This is our device as mentioned. And now our device is sort of communicating with the DB, which in our case is going to be superbase. We've
1:21:571 heure, 21 minutes et 57 secondesjust verified basically that the app can create sort of like a little off page.
1:22:021 heure, 22 minutes et 2 secondesOkay, this information can then trickle back to Superbase and then we can, you know, have a couple of rows or whatever with like different different uh users.
1:22:091 heure, 22 minutes et 9 secondesWhat we have to verify now is basically how about all the data within that user and that's pretty easy to see as well.
1:22:141 heure, 22 minutes et 14 secondesAll you need to do is go up here to where it says uh table editor and then you can actually see the individual or independent table. So challenges, completions, habits, profiles. Probably
1:22:221 heure, 22 minutes et 22 secondesthe simplest one for you guys to see is habits because we just created some habits. And you can see that for a specific user ID, okay, which is 3F56A
1:22:301 heure, 22 minutes et 30 secondeswhatever. If I click this, you could see that this is actually uh Nicholas Sarrive. Okay, it's me. For that specific user, they have four things.
1:22:401 heure, 22 minutes et 40 secondesThey have a a habit called read, another habit called walk, another habit called journal, another habit called ASDF. And if I go back to my app, you can see this is actually like live, right? This is
1:22:481 heure, 22 minutes et 48 secondes100% live. It's like being tracked right now. Okay, you can see the reminder hour for one of these is set as 12. What do I mean by that? I can go to manage. I can
1:22:561 heure, 22 minutes et 56 secondesscroll down. And I can see that information is reflected inside of my database. Right. Um I can also just remove this. Maybe delete it. Okay. Then
1:23:051 heure, 23 minutes et 5 secondesI can go back here and I can give this a quick little flicker. And you can see now what happened. We went from four records in our database to three. Why?
1:23:141 heure, 23 minutes et 14 secondesBecause we just deleted. And when we delete it, there's a line of code basically that cloud set up where it's like, hey, when you delete it, I want you to delete it from the database as well. So how neat is that? You can also,
1:23:221 heure, 23 minutes et 22 secondesyou know, check to see what all of these do. So reminder enabled, false, false, false. So maybe I want to go true, true, true. Okay, we're I'm actually just
1:23:301 heure, 23 minutes et 30 secondesgoing to set all these. I'm going to refresh. If I go down to this reminder enabled now, just to really prove it to you guys, you can see that they're all
1:23:371 heure, 23 minutes et 37 secondestrue. And then I can change the hour. It looks like we also have the ability to change a minute, which is kind of neat.
1:23:421 heure, 23 minutes et 42 secondesU profiles here. This is basically all of the additional information for the user. So in this case, they just have onboarding complete, and that's additional information aside from my
1:23:501 heure, 23 minutes et 50 secondesemail address and stuff like that. You can imagine how you can make this as complicated as you want. Completion. So this is basically every single time I've completed a habit. It stores the exact
1:23:581 heure, 23 minutes et 58 secondesdate, the count, and the habit ID. So you know, in 3 months from now, I'll be able to look back inside of my uh database, and I'll see, hey, you know, I've actually finished three habits on
1:24:051 heure, 24 minutes et 5 secondesthis day. What are the IDs of those habits? Well, it's 1 177817. And then the app can basically go and it can look for that specific ID and say, okay, so
1:24:131 heure, 24 minutes et 13 secondeshe did three of read, then walk, then journal, which is pretty neat. So, this isn't a comprehensive database walkthrough by any means, but I want you guys to know that more or less all
1:24:211 heure, 24 minutes et 21 secondesdatabases work in the same way nowadays, or at least like the SQL databases, which is the specific type that we're using and the one that I'd recommend for most apps. Um, you're basically just
1:24:291 heure, 24 minutes et 29 secondesgoing to have, you know, the database, which you're going to set up using this little um what's called a schema editor, which AI will do for you. It'll set up multiple of these like data structures.
1:24:371 heure, 24 minutes et 37 secondesSo, habits, completions, challenges, these are called tables. And then what they'll do is they'll associate that to different user ids using this
1:24:441 heure, 24 minutes et 44 secondesauthentication um page which is where you you know have like the the specific users that signed up and you can manage all this stuff using um you know like in in our case superbase but usually no
1:24:531 heure, 24 minutes et 53 secondesmatter what app you're using or what sort of database you're using there's going to be some sort of interface where you can do things like you know create new users on the fly and so on and so forth. Now it's not enough just to do
1:25:011 heure, 25 minutes et 1 secondethis and test it obviously on my computer. I also have to test it on expo and then I want to test it on mobile as well. And the reason why is because I want to verify that the stuff that I
1:25:091 heure, 25 minutes et 9 secondesjust showed you that you know me creating a habit or signing up with a new user or whatever reflects not just through like the little Chrome tab but
1:25:161 heure, 25 minutes et 16 secondesalso through you know my my my phone as well as you know that Expo server. And so what I'm going to do offscreen here is I'm going to go through another two levels of testing. I'm going to make
1:25:241 heure, 25 minutes et 24 secondessure that it works on my computer the exact same way it works on Expo and then ultimately like on mobile because I want to see if there are any weird sort of interactions, if the haptics are off, if
1:25:321 heure, 25 minutes et 32 secondesthe icons get cut off halfway through and stuff like that. Unfortunately, this testing loop is mandatory and you're just going to have to do this every time you design an app. There are some
1:25:391 heure, 25 minutes et 39 secondespromising approaches where Claude can actually test things for you on the computer. Um, but I've yet to find one that is automated that also allows it to test it on your phone. So, until we get
1:25:471 heure, 25 minutes et 47 secondesto that point, uh, you know, you're going to have to do some of that testing manually. And I'd always allocate an additional 10 or 15 minutes. Anytime you do encounter an error, you know, I'd
1:25:551 heure, 25 minutes et 55 secondesrecommend just voice transcribing what the error is, speaking in plain natural language to clot, and it'll probably be able to do a good job. But that's what I'm going to do now. I'm going to go through the process of setting up that
1:26:031 heure, 26 minutes et 3 secondesExpo server like I talked about and then I'm also editing it on my phone. All right, so I've bug handled, I've fixed everything, and I've verified that it's
Chapitre 20 : Enhancing User Experience
1:26:101 heure, 26 minutes et 10 secondesgood to go. I mean, we could publish our app right now, but as promised, I want to take you guys through higher and higher levels of functionality through this course. So, before we finish up and
1:26:191 heure, 26 minutes et 19 secondeswrap up with this habit tracker, um, I actually want to add two additional features. And these are both features which are going to rely on third-party
1:26:271 heure, 26 minutes et 27 secondesservices or APIs, specifically AI services or APIs uh to basically do things for our users in the background.
1:26:341 heure, 26 minutes et 34 secondesAnd I did some reflection on it and there are two here that I really want.
1:26:371 heure, 26 minutes et 37 secondesThe first is I want some form of smart coaching or nudges. And you guys may see stuff like this get rolled out to more apps over the coming weeks and months.
1:26:451 heure, 26 minutes et 45 secondesI've seen this on like my Whoop band app for instance. I've seen smart coaching in a couple of other places. But basically what I want is I want
1:26:521 heure, 26 minutes et 52 secondesperiodically to analyze the streak and consistency data in our database to send personalized motivational messages or
1:27:001 heure et 27 minutessuggest when to adjust their goals. So, an example might be, you know, once every day or week, whatever the cadence
1:27:071 heure, 27 minutes et 7 secondesis that we figure out with Claude, uh, you know, we're going to analyze the back end and then more or less push a notification. And the notification might
1:27:141 heure, 27 minutes et 14 secondessay, "Hey, you've nailed sleep for 14 days. Congrats, but we're noticing that water intake is low. Here's a quick hack that you could use, let's say, to
1:27:221 heure, 27 minutes et 22 secondesimprove your water intake." Okay, so this smart coaching and sort of nudge feature is sort of one of the two I want to implement. And then there's one other
1:27:301 heure, 27 minutes et 30 secondesone as well uh called reflection summaries which uh basically on a weekly maybe monthly basis I want to AI
1:27:381 heure, 27 minutes et 38 secondesgenerate reports that go into detail uh basically giving people significantly more context about how far they uh they've gone. So for instance you're the
1:27:471 heure, 27 minutes et 47 secondesmost consistent with meditation at 92% but exercise dropped off midweek. Uh you know you scored 19% out of your goal of 33% on X Y and Z and so on and so forth.
Chapitre 21 : Smart Coaching Implementation
1:27:591 heure, 27 minutes et 59 secondesOkay. So anyway, whatever the features are aren't super important. I'm just going to show you guys how how you can implement them now. And it's fairly straightforward. Um, basically so that
1:28:081 heure, 28 minutes et 8 secondesyou know right off the bat, you know what we're doing here is we're introducing another service aka another layer to things. And so in the in the case of our AI coaching architecture,
1:28:171 heure, 28 minutes et 17 secondeswhat we're going to be doing is we're going to have our mobile app which is sort of over here. Okay. And uh again you know I just I want you to to understand that this mobile app so I can
1:28:261 heure, 28 minutes et 26 secondesmake my pen work for once is actually connected to you know in this case our phone you know pay don't pay attention
1:28:331 heure, 28 minutes et 33 secondesto that specific diagram but basically this application is running on our phone okay and uh basically our phone you know is going to load up the app and when the
1:28:421 heure, 28 minutes et 42 secondesapp let's say wants to do this I don't know maybe daily or weekly depends on whatever claude thinks makes more sense for a database architecture which I'll
1:28:511 heure, 28 minutes et 51 secondesremind you guys to in a second. Um, you know, on a daily or weekly cadence, our mobile app is going to fire off a a function call, basically a request to a
1:28:591 heure, 28 minutes et 59 secondesservice. And this is going to be managed by a tool called Superbase Edge Functions, which are basically simple uh
1:29:061 heure, 29 minutes et 6 secondesserverless backend tools that allow us to on whatever schedule we want just fire something really quickly and
1:29:131 heure, 29 minutes et 13 secondesextemporaneously like very very um transiently uh over to another service.
1:29:191 heure, 29 minutes et 19 secondesAnd so this is sort of our back end here. This is our catch hall. And the alternative to this is you setting up an always on server which is just constantly waiting you know 24 hours of
1:29:271 heure, 29 minutes et 27 secondesthe day. What this is this is a server that basically turns on very briefly for like 1 second fires our function and then turns off. And the reason why uh
1:29:351 heure, 29 minutes et 35 secondesyou know this this edge function and sort of serverless function exists is simply because it's more compute efficient and then it saves us a lot of money. Like you wouldn't be able to run
1:29:431 heure, 29 minutes et 43 secondesthis anywhere near as cheaply if you had a server that was always on. Okay. At least for our level of scale. this is um the way we're going to do it. So we're going to use these superbase edge functions and then basically what
1:29:511 heure, 29 minutes et 51 secondeshappens is okay you know like um you know it's on our phone the mobile app is initialized everything set up and then daily or weekly we'll fire off one of these superbase edge functions okay
1:30:001 heure et 30 minutesthese functions are first just going to read our database so it's going to read in our case maybe the habits the completions the streaks compile a big package okay and then we're going to
1:30:091 heure, 30 minutes et 9 secondessend it to an AI and so there's sort of a two-way graph here right this is going to send a request this is going to get all of the data so the habit data
1:30:161 heure, 30 minutes et 16 secondescompletion data streak data send it back over here we're It's going to like dump all that stuff to an AI model, in our case, cloud API. And we're going to do so alongside some sort of, I don't know,
1:30:251 heure, 30 minutes et 25 secondesprompt. And the prompt is going to be really simple and really straightforward. I'm basically going to say like, hey, here is an example of a a
1:30:321 heure, 30 minutes et 32 secondesa coaching message. Your job is to come up with a bunch of coaching messages, go through the user's data and stuff like that, and then do so. Understand that this is going to occur on like a daily, weekly, or monthly basis, whatever.
1:30:421 heure, 30 minutes et 42 secondesThen, um, you know, what's going to happen is we're going to return that, okay, right over here. We're then going to dump that in um our database except now this is going to be like I don't
1:30:511 heure, 30 minutes et 51 secondesknow some sort of like coach message feature. After that that is going to come back to our superbase edge function which is going to deliver it to our
1:30:581 heure, 30 minutes et 58 secondesmobile app. And then finally our mobile app is going to send um in essence some form of like push notification as well as maybe some persistent notification um
1:31:061 heure, 31 minutes et 6 secondesin you know on our phone. So that is in general sort of like what the highle architecture of this is going to look like. And I just want you guys to know this is just more or less how all tools
1:31:141 heure, 31 minutes et 14 secondesand apps and services that you integrate within an uh you know like a phone app actually work like you're always going to have like these core features. You're
1:31:221 heure, 31 minutes et 22 secondesgoing to have the app, you're going to have the the server, okay? You're going to have the database and then you're going to have whatever API it is that you're reaching out to. In our case, we're just reaching out to claude API.
1:31:301 heure, 31 minutes et 30 secondesBut uh you know, as you'll see as we develop, you know, our calorie tracker app after this one and and you know, other additional functionality, this is just going to be the same loop over and
1:31:381 heure, 31 minutes et 38 secondesover and over again. starts with phone, goes like this, goes back and then basically just continu continuously goes back and forth like this. So don't worry
1:31:471 heure, 31 minutes et 47 secondestoo much about the specifics and sort of the technical features. Just understand that this is the flow uh of you know in our case our AI coaching architecture
1:31:541 heure, 31 minutes et 54 secondesapp and then also the uh the reflection summary stuff. So where do we go from here? Uh it's actually fairly straightforward. I'm just going to um
1:32:021 heure, 32 minutes et 2 secondesactually feed in both of these to AI requesting that they do them and I'm even going to feed in a little screenshot of the AI coaching architecture. But I want you to know Claude probably would have come up with
1:32:101 heure, 32 minutes et 10 secondesbasically the same thing just cuz that's more or less how all of them work. So let's head over here to our anti-gravity and then I'm just going to paste this in. So we'll say smart coaching and
Chapitre 22 : Finalizing App Security Measures
1:32:181 heure, 32 minutes et 18 secondesnudges. We'll also say reflection summaries.
1:32:221 heure, 32 minutes et 22 secondesThen I'm just going to use a voice transcript tool to say I'd like to implement both of these features into our application. I want you to use Claude as the backend and then send the
1:32:311 heure, 32 minutes et 31 secondesrequest via Superbase. Um use pretty smart models. Let's use the sonnet models for Claude. Um, and then you'll
1:32:381 heure, 32 minutes et 38 secondesalso have to update the database and do everything like that to ensure that it works alongside the the flow diagram that I'm attaching.
1:32:461 heure, 32 minutes et 46 secondesOkay. And I'm just going to zoom in so you guys could see it a little bit better. And then just because I don't want to give it too much text and context, I'm just going to zoom out a
1:32:531 heure, 32 minutes et 53 secondesbit. And then I'll just screenshot. And you can feed screenshots in. Um, one thing that we'll do with the next app that we create is I'm going to show you
1:33:001 heure et 33 minutesguys how you can take screenshots of another app and use that to inspire your design. Um, so we're not going to duplicate or copy the design of an an
1:33:091 heure, 33 minutes et 9 secondesapp, but we can definitely use, I don't know, the Apple design schema or like the Microsoft design schema or something just as inspiration to get like the
1:33:171 heure, 33 minutes et 17 secondespadding, the corner radius, the little rounded circles, the outlines, all that stuff that like makes a design a design
1:33:241 heure, 33 minutes et 24 secondesum in at least initially and from there we'll be able to customize and so on and so forth. So, uh, images and screenshots and stuff like that are a very important part of any sort of design loop nowadays
1:33:331 heure, 33 minutes et 33 secondeswith AI. And you guys will see how to do that on the next app. What it's doing now is loading the superbase skill and then checking um the docs for edge
1:33:411 heure, 33 minutes et 41 secondesfunctions. So, edge functions are very particular type of tool. Claude is going to have to actually read up on what the tool is and how it works before it implements it. For those of you guys
1:33:501 heure, 33 minutes et 50 secondesthat don't know, if you just hold control and then press O over here, and I think this works on both Mac and PC, you can actually see a much more detailed breakdown of everything that's
1:33:571 heure, 33 minutes et 57 secondessort of going on under the hood. So, for instance, basically what we're seeing up here is just a brief summary. But, um, if you hold control and press O, you can actually see like this is loading all of
1:34:061 heure, 34 minutes et 6 secondesthis documentation into context right now. And this is all like edge function documentation. So, you know, here's how to test with curl, here's deployment, here's deploy function. I don't want to
1:34:141 heure, 34 minutes et 14 secondesknow how all this stuff works because it's obviously extraordinarily in-depth and kind of confusing for me. All I like
1:34:221 heure, 34 minutes et 22 secondesknowing is basically that clot has all the context that it needs. So every now and then I'll just hold control and press O, open it up and and take a peek at sort of what's going on under the
1:34:301 heure, 34 minutes et 30 secondeshood. On the bottom right hand corner here, you can see that we're using a fair number of tokens for this. So I just zoom in a bit. Um we're from 20,000
1:34:381 heure, 34 minutes et 38 secondesup to about 51,000 or so. And so what that means is, you know, 20,000 is basically the floor for most of the time. Like when you start a new cloud
1:34:461 heure, 34 minutes et 46 secondeschat, you'll already be at about 20,000 tokens because there's a fair amount of context that just naturally gets loaded in. You know, it'll like read through your files. It'll read that like
1:34:541 heure, 34 minutes et 54 secondesclaude.md initialization thing. It'll it has some built-in tools and stuff like that that are already part of the prompt that you just can't see. Um, but
1:35:021 heure, 35 minutes et 2 secondeseverything from here on out is actually just like claude consuming our token usage. So understand that uh you know these features are are not free.
1:35:101 heure, 35 minutes et 10 secondesBasically what we are currently doing is we are translating or converting two currencies uh you know tokens and money
1:35:171 heure, 35 minutes et 17 secondesto feature. And the whole idea with SAS as I think we continue to get further and further into you know our AI future
1:35:241 heure, 35 minutes et 24 secondesis that there will soon come a point where you know nobody will want to use like a templated SAS at all. I think what we're probably going to do is most
1:35:321 heure, 35 minutes et 32 secondesof these apps are actually going to be like headless or uh like backends that any user can connect a front end to. and you know use whatever functionality they
1:35:411 heure, 35 minutes et 41 secondeswant. So in the case of a habit tracker app for instance you know we might deliver an app right out of the box to a bunch of users and they'll they'll happily pay money for it but uh you know
1:35:491 heure, 35 minutes et 49 secondesmaybe they want it to like look a certain way and then they'll use their AI to make some minor adjustments to the app uh and maybe that's like an additional plan or feature or something like that. So that's basically what
1:35:581 heure, 35 minutes et 58 secondeswe're doing right now. We're just taking like out of the box functionality and we're just making it better, right? sort of uh an example I was given maker school which is my um AI automation
1:36:061 heure, 36 minutes et 6 secondescommunity where I show people basically how to monetize all the skills that I'm providing you here is you know back in the day marketing teams would uh build
1:36:141 heure, 36 minutes et 14 secondesthese things called lead magnets and lead magnets are usually just little PDFs or you know three to five page documents that like teach people how to
1:36:211 heure, 36 minutes et 21 secondesdo something and the thing about a lead magnet is lead magnets were also always very templated and so you know you just wrote it once and the idea was well you'll just send it to a bunch of people
1:36:291 heure, 36 minutes et 29 secondesanytime somebody needs help with But, you know, because they're very templated, they don't solve everybody's problem super specifically. They just provide like a general walkthrough of
1:36:381 heure, 36 minutes et 38 secondeshow to do something. Imagine though if you could customize that walkthrough to like a person's reading level, to their ability, to their experience, and so on and so forth. And that's basically what
1:36:451 heure, 36 minutes et 45 secondesAI SAS apps allow us to do. And so, just like lead magnets nowadays in uh insert current year, my strategist told me not to include the year in my YouTube videos
1:36:541 heure, 36 minutes et 54 secondesanymore, which I would agree. Um, but just like, you know, lead magnets don't really work super well anymore because people are just like, "Well, can't I
1:37:011 heure, 37 minutes et 1 secondejust ask AI and it'll give me more customized information?" So, too, I think do like out of the box SAS apps just slowly lose more and more of their
1:37:081 heure, 37 minutes et 8 secondesum value when we when we get into an AI age. So, yeah. Anyway, to make a long story short, I don't want to get too philosophical here. I just um I basically did a currency conversion on
1:37:161 heure, 37 minutes et 16 secondesthe cost of 40,000 tokens on my cloud subscription over to like a customized feature in an app that I really like.
1:37:231 heure, 37 minutes et 23 secondesOkay, so it's saying clean. Here's a summary of everything that was built. So what was created database coaching messages reflection summaries superbase edge functions generate coaching
1:37:311 heure, 37 minutes et 31 secondesgenerate reflection app side you know we have context and and and app layout and so on and so forth. Now you'll see that it is asking me for something to set the
1:37:401 heure, 37 minutes et 40 secondesentropic API key. So I basically need to do some things. Um it's it's asking me to run the new table. So what I'm going to do is I'll just say do everything for me that you can without the API key.
1:37:511 heure, 37 minutes et 51 secondesthen walk me through the API key as well. Now I already know what the API key bit is since we're using another
1:37:581 heure, 37 minutes et 58 secondesservice. Okay, anytime you use another service, you're always going to be um you need to authenticate, right? And so what's happening here is when the Superbase Edge function, this goes to
1:38:061 heure, 38 minutes et 6 secondesour database and then like collects a bunch of information. Database sends a request back. Remember um this is our actual device over here. And basically what's occurring is the the message is
1:38:151 heure, 38 minutes et 15 secondesgoing from our phone to the mobile app to Superbase down here back up here. And then in order to actually access, you know, Claude, we need some form of O.
1:38:251 heure, 38 minutes et 25 secondesAnd so you'll you'll always need an API key of some kind, which solves that problem. You can think of it as just like a password that allows you to sign in. Uh and that's that's kind of what
1:38:321 heure, 38 minutes et 32 secondeswe're doing here. So anyway, it's it's done and created everything that it can.
1:38:361 heure, 38 minutes et 36 secondesAll we need to do is now set the API key. And you'll see it actually gives us um the steps. You just go to platform.cloud.com cloud.com and you know this feature is not going to be free right this is obviously something
1:38:441 heure, 38 minutes et 44 secondeswe are paying for it's an API it's an app right um but anyway go here create a new API key paste it into the above now if you don't already have an account
1:38:521 heure, 38 minutes et 52 secondesyou're going to have to create one in my case I already have an account so I'm just going to go platform make a left click and then I'm just going to sign into my uh to my email address now that
1:39:001 heure et 39 minutesI'm signed in you'll see I have a bunch of pre-existing API keys already but uh just to show you guys how this works I'm actually going to create a totally new
1:39:071 heure, 39 minutes et 7 secondesnot expiring key and I'll go add. Okay, so that's the whole API key right over there. And you know, now I have it copied. And what I need to do is I just
1:39:151 heure, 39 minutes et 15 secondesneed to go to anti-gravity. And it'll tell you not to um you know, actually paste it directly in plain text. And in general, like you you shouldn't I'm just
1:39:221 heure, 39 minutes et 22 secondesbeing lazy here because I just want to speed this thing up. Um but in general, instead what you should do is you should go to this env here. And then you should just paste the key in sort of like this.
1:39:321 heure, 39 minutes et 32 secondesEnthropic API key equals and then just paste paste it in here. And then you save the file.
1:39:381 heure, 39 minutes et 38 secondesAnd the reason why is because this is basically like your password manager.
1:39:411 heure, 39 minutes et 41 secondesJust contains all your passwords. Um when you insert it into a chat like I just did here. Basically what's happening is um Claude stores all of our
1:39:491 heure, 39 minutes et 49 secondesconversation history locally on our computer. So this is now going to be stored in multiple places. It's not just going to be stored in this little password uh manager file which it'll
1:39:561 heure, 39 minutes et 56 secondesautomatically add things to. It'll add it to everywhere. It'll add it to like this chat. It'll add it to this password manager. It'll add it to our super basease and so on and so forth. Anyway,
1:40:051 heure, 40 minutes et 5 secondesnow that it's done, I'm just going to say, "Okay, let's test on computer." And then, you know, we're just going to go through that three-step loop where we
1:40:131 heure, 40 minutes et 13 secondesstart with a computer and then we go to our Expo and then after Expo, we go to um, you know, our phone and then just
1:40:201 heure, 40 minutes et 20 secondeskind of loop back and forth. See here, I have my email address sign in. So, I'm then going to do this. I don't actually
1:40:281 heure, 40 minutes et 28 secondesremember my password. We'll see if that worked. No, it didn't work. Okay. So, why don't I just go Oh, maybe it's this one. How am I already forgetting my
1:40:361 heure, 40 minutes et 36 secondespassword? That's so silly. Let's go sign up. I'm just going to um see if I can create a new account here. Looks like the user is already registered. So, I'm
1:40:441 heure, 40 minutes et 44 secondesI'm just going to sign up with a different email. You can imagine how one cool feature would be a forgot password feature. So, I'll say implement a forgot
1:40:531 heure, 40 minutes et 53 secondespassword feature. Um and I'll just have that churning in the background while I'm there. And then here I'm just going to sign up.
1:41:021 heure, 41 minutes et 2 secondesCool. That looks like I'm now signed up. I can now get started. We're logged in.
1:41:061 heure, 41 minutes et 6 secondesHow it works. Create the habits. So on and so forth. Good. Walk, journal, sleep 8 hours. Good. Start challenge. Okay.
1:41:131 heure, 41 minutes et 13 secondesAnd you can see here probably just as part of a test, although I will verify.
1:41:161 heure, 41 minutes et 16 secondesYou can see it says get today's coaching nudge. So this will basically look through our behavior and then actually fire it off. And I'll and I'll take a look at that just in one second. I just
1:41:241 heure, 41 minutes et 24 secondeswant to make sure that everything else is good. We have a weekly reflection feature down over here.
1:41:291 heure, 41 minutes et 29 secondesOkay, cool. We have everything that we need. So, I'm just going to get today's coaching nudge. Click that button and see what happens because that's kind of the core piece of functionality. And
1:41:371 heure, 41 minutes et 37 secondesideally, instead of just getting the coaching nudge, what we realistically want is, you know, we want the uh we want the thing just to pop up as a
1:41:441 heure, 41 minutes et 44 secondesnotification outside of the app and then we also want it to pop up as sort of the AI coach inside of the app. So, I'm going to say is great. I don't just want
1:41:531 heure, 41 minutes et 53 secondesthe user to manually generate the coaching nudges, though. I'd like you to come up with some automatic cadence and then populate it in the app. The idea is every time the user comes onto the app, they have some form of coaching.
1:42:031 heure, 42 minutes et 3 secondesAdditionally, I want some sort of push notification so that, you know, if I'm out and about doing my thing, um, you know, and it's 3 p.m. or something, it
1:42:121 heure, 42 minutes et 12 secondesfires off and then sends me a push saying, "Hey, Nick, I noticed you've been crushing it on X recently, but have you considered why? Here's a quick and
1:42:191 heure, 42 minutes et 19 secondeseasy way to do this." Awesome. And my voice transcript tool here did a pretty good job of converting my requests and what I wanted directly in. And I see now
1:42:271 heure, 42 minutes et 27 secondesit's saying we've also automatically implemented the forgotten password feature, which is kind of neat. Okay, so yeah, that's on the coaching nudge. And it looks like, you know, I can only
1:42:351 heure, 42 minutes et 35 secondesclick on this once because it's not it's not repopulating. So that's another feature I'm going to want to fix. And this generate weekly reflection feature
1:42:421 heure, 42 minutes et 42 secondesas well. If I give this button a click, I think I can just do this more or less every week. Uh, I don't actually currently have, you know, built-in. I
1:42:511 heure, 42 minutes et 51 secondesdon't have a lot of data, basically. So, the probability of this being able to like actually give me something good or meaningful is pretty low, but let's read it regardless. The past week was a tough
1:42:591 heure, 42 minutes et 59 secondesone with an overall completion rate of just 14% across your top three habits, journal, walk, and sleep. The one bright spot was Friday, which is today, which
1:43:061 heure, 43 minutes et 6 secondeswhere you managed to complete all three habits in a single day, which shows you absolutely have the capacity to do this when the conditions are right. the rest of the week, Monday. Okay. And it just
1:43:141 heure, 43 minutes et 14 secondesupdated the app, unfortunately, which is why we can't see it. But you'll notice that it just cached it, right? So, we're pulling up the exact same thing Monday through Thursday in the weekend. So, zero completions across the boards. The
1:43:231 heure, 43 minutes et 23 secondesmain challenge right now is to consistency beyond that single good day for the coming week. Try to reverse engineer it. Mid Friday work for you, whether it was your schedule, energy, or mindset, and see if you can
1:43:301 heure, 43 minutes et 30 secondesintentionally recreate those same conditions on at least two or three other days. Okay, cool. Looks great. You can see now we no longer have the little
1:43:381 heure, 43 minutes et 38 secondescoaching feature thing right up here, which is nice. Um, this looks pretty good as well. Awesome. So, I'm just going to generate that weekly
1:43:461 heure, 43 minutes et 46 secondesreflection. See if the same thing pops up. Good. So, this is illustrating to me that our like reflections and nudges are sort of in our database already. Right.
1:43:541 heure, 43 minutes et 54 secondesSo, I'm just going to let this continue on until we get uh everything with the nudging feature and stuff like that exactly how I want. And then I'll circle back and uh show you guys. Also, I'm
1:44:021 heure, 44 minutes et 2 secondesrealizing there's this slight little black border around this div. And uh that just looks silly considering everything else does not have a black border. So just while we're editing all
1:44:111 heure, 44 minutes et 11 secondesof this stuff, I'll also say I've noticed there's a black border around the top bar.
1:44:181 heure, 44 minutes et 18 secondesThe one that says 3day kickstart. Uh it doesn't look like any other div has a black border. So just fix this and ensure that the design is uniform across the app.
1:44:281 heure, 44 minutes et 28 secondesNow you notice what I'm doing here is I'm starting to queue up messages. And the reason why is because I don't have to wait for cloud to finish the previous thing in order to start on something
1:44:351 heure, 44 minutes et 35 secondesnew. um especially if it's like kind of unrelated. And so what what it was doing over here was it was doing like AI coaching features. What it's doing over here is just doing design features. And
1:44:431 heure, 44 minutes et 43 secondesso I I'm happil I'm happy to like ceue up as many messages as it takes. Um doing it in this way is just a lot cleaner for me and a lot simpler. And you see that, you know, just while I was
1:44:521 heure, 44 minutes et 52 secondesexplaining this to you, it's gone ahead and actually edited that. Um so I think that looks way cleaner than it did before. So let's actually just read through what else we have here. So auto
1:45:001 heure et 45 minutescoaching on app open. Cool. So it's every time you open the app, right? And then if there's um a recent coaching message within 12 hours, it'll instantly do it. There's daily push notice. Great.
1:45:091 heure, 45 minutes et 9 secondesI'm noticing right now because we're testing and I don't have any pre-existing um app or uh habit tracking
1:45:161 heure, 45 minutes et 16 secondesor usage. The reflections and the nudges are all very simple. I'd like to test this out with simulated history. Go through and send me 10 examples of coaching u nudges and then reflections.
1:45:301 heure, 45 minutes et 30 secondesAnd I'm asking this because I just want to see, you know, if we were to run this 10 times with a a big diversity of different activities and stuff like that in the background, what sort of messages
1:45:371 heure, 45 minutes et 37 secondeswould we actually see? And so, um, you know, that's how I'm going to modify the prompt that the AI is using to call the other AI, I think, uh, is probably the
1:45:451 heure, 45 minutes et 45 secondessimplest way to put it. Okay. And I should also organize this a little bit simpler. It'll realistically look like this, which will change the UX and stuff. So, just important to do. Okay.
1:45:541 heure, 45 minutes et 54 secondesAnd you can see what it's done sort of in the background. If you can read computer speak, um it's just sent 10.
1:46:001 heure et 46 minutesOkay. And so that's what all of these are. So I'm just going to take a quick peek at these and make sure they're not total trash. Um the first is crushing meditation water dropping off. So you'll
1:46:081 heure, 46 minutes et 8 secondessee there'll be like a notification with a header sort of at the top of your your your push page saying your meditation streak is genuinely impressive. 14 days at 100% this week shows real discipline,
1:46:171 heure, 46 minutes et 17 secondesbut hydration is great. Quietly working against you with only two out of the last 7 days completed. No streak to speak of. One thing I don't like is I don't like these M dashes because that's
1:46:251 heure, 46 minutes et 25 secondesvery AI. So, I'm just going to say this looks great, but modify the prompt so um Claude does not output any M dashes. M dashes are very typically AI. And the
1:46:331 heure, 46 minutes et 33 secondesmore m dashes we have in these messages, the less humanlike they'll seem.
1:46:391 heure, 46 minutes et 39 secondesOkay, so I'm going to do that while it's outputting the previous response just because that's obviously something that I can do reasonably quickly. And the idea is these next ones should not have
1:46:481 heure, 46 minutes et 48 secondesum any M dashes. Okay. And then what else we got? So, let's see. Solid week, meditation star, gradual improvement trend, perfect week. Let's also add some
1:46:571 heure, 46 minutes et 57 secondesemojis to these titles specifically. And I just want the titles to have emojis. I don't want anything else to have emojis. And
1:47:061 heure, 47 minutes et 6 secondesit looks like, you know, if we did a bunch of quantity habit apps, your strongest performance this month was read 30 pages that you completed 21 out
1:47:141 heure, 47 minutes et 14 secondesof 30 days at a 70% consistency rate, showing you can build real momentum when a habit clicks. your 10,000 steps have it also held its own at 60% giving you a
1:47:221 heure, 47 minutes et 22 secondessolid physical foundation to build on and then we also have a bunch of that need attention and stuff like that. So like if you think about the purpose of um like a review versus a nudge, like a
1:47:311 heure, 47 minutes et 31 secondesreview or reflection is like a lot longer, right? It's kind of a retrospective and I done whereas a nudge is a lot shorter and it's simpler and
1:47:381 heure, 47 minutes et 38 secondesthere's a brief little title and then like a oneline message. And so I think this is a good combination of both. The retrospectives, the the reflections and the reviews, these are very long, but
1:47:471 heure, 47 minutes et 47 secondesthen those little nudges are just, you know, two sentences. Okay. So, I'm just going to scroll all the way down. And you can see we have a couple of emojis
1:47:551 heure, 47 minutes et 55 secondesin the nudges now, which is cool. Rerun this, but just do it three times so we could see how they look.
1:48:041 heure, 48 minutes et 4 secondesAnd now what I'm doing here is I'm just having it actually show me some examples. I always want to see some examples of these outputs before I like 100% hardcode this into the app and then go through the whole testing procedure.
1:48:151 heure, 48 minutes et 15 secondesOh, also speaking of testing, come up with a way that I can quickly generate or test these because I'm going through a endto-end test right now.
1:48:231 heure, 48 minutes et 23 secondesOkay, and now we're taking a look at the nudges. Your meditation habit is genuinely impressive. 14 days straight and perfect consistency this week. So, you clearly know how to lock something in. Notice how there are no M dashes,
1:48:331 heure, 48 minutes et 33 secondesright? They just have these dashes, which are just sort of like the way it's presenting the information to me. Um, after I asked it to give me like a
1:48:411 heure, 48 minutes et 41 secondeslittle tool, what it's doing is adding buttons to simulate 30 days of habit history and then trigger the coaching and reflection generation just so I could see the the UX as well, cuz that's
1:48:491 heure, 48 minutes et 49 secondespretty important to me. I want to be able to see sort of the way it's going to look in in a real app. Okay. And it looks like it's just done this. So, I'm going to head over to the app as well.
1:48:581 heure, 48 minutes et 58 secondesAnd I'm just going to give this a little refresh. Okay. And you can see it actually automates the process of getting the coaching nudge, it looks like. And I think that just triggered a
1:49:071 heure, 49 minutes et 7 secondespush notification. Although I can't see it cuz I am local. That's why you always have to test things in your computer as well. So I can see I can generate a
1:49:151 heure, 49 minutes et 15 secondescoaching nudge and I can't see the coaching nudge which is unfortunate.
1:49:191 heure, 49 minutes et 19 secondesGenerate the weekly reflection. Probably not going to be able to see that either. Nope. How about a monthly reflection?
1:49:241 heure, 49 minutes et 24 secondesOkay, so it looks like we have daily coaching nudges, weekly reflections, then monthly reflections which is interesting. Because I'm running this locally in Chrome, I can't actually see
1:49:321 heure, 49 minutes et 32 secondesthese come up as notifications. Anyway, we could simulate them. uh brief little simulated modal or toast or something like that. For those of you that don't
1:49:401 heure, 49 minutes et 40 secondesknow, a modal is just something that pops up on your app screen really briefly. So, it's like a full page sort of like thing and then can disappear.
1:49:471 heure, 49 minutes et 47 secondesAnd a toast is a much smaller version of that. A toast is basically a notification. If you guys have ever seen uh those little like rectangular bars that like pop up when you get a text
1:49:551 heure, 49 minutes et 55 secondesmessage, what that's called is a toast notification. So, what we're doing here is I'm basically having the app simulate one of these so that I could see it
1:50:031 heure, 50 minutes et 3 secondeswithin my Chrome uh u sort of local run, even if it's not something that I have the ability to get real notifications in
1:50:101 heure, 50 minutes et 10 secondesright now as a test. I just want to be able to simulate and then make sure it 100% works because the cost of doing this and then verifying whether or not
1:50:181 heure, 50 minutes et 18 secondesit looks and and reads the way that I want it to read in this sort of simulated aspect is way lower than the cost of me doing it wrong the entire way
1:50:261 heure, 50 minutes et 26 secondesthrough the testing loop from Chrome to Expo to my mobile. Okay. Okay. So, what I'm going to do here is I'm just going to refresh this cuz it just gave me the
1:50:351 heure, 50 minutes et 35 secondesthe the final button. And I want to simulate 30 days of habits where some are mixed, some are 50%. So, if we go
1:50:431 heure, 50 minutes et 43 secondesback here, you can see that I have a couple of tracked days. Now, these are my 30 days of previous habits. And now I
1:50:501 heure, 50 minutes et 50 secondesthink I can simulate some form of notification. You can see edge function returning on to see see what I was saying here. So, this is actually simulating a notification, but uh the
1:50:591 heure, 50 minutes et 59 secondesfunction failed. And so there's actually no there's nothing happening underneath if I had waited the entire way through to my phone. You know, I would have had
1:51:061 heure, 51 minutes et 6 secondesto like go through this whole step, this whole process multiple times. Um, so I just basically saved myself a little bit of time there, which is quite nice. And that's what the push notification toast is kind of going to look like.
1:51:171 heure, 51 minutes et 17 secondesOkay. All right. So this is going to uh do some real user JWT stuff. It looks like it was just a minor authentication error, and that's all good. Uh, we'll
1:51:251 heure, 51 minutes et 25 secondeswait for that to finish and then circle back. And now that it's done, you can see I reimulated that and we had a really nice push notification right there. And uh you know, we got a little
1:51:341 heure, 51 minutes et 34 secondeslike robot coach up top, little toast scrolls down. You've hit all three habits today, but your 30-day consistency sitting at just 3% tells me
1:51:411 heure, 51 minutes et 41 secondestoday might be one of those fresh dot dot dot days. You know, if you're on your phone, you give it a click, it opens up the actual notice, and then you're you're in the app, which is quite nice. So, that's a lot better. And now I
1:51:491 heure, 51 minutes et 49 secondescan actually go through the rest of the testing loop, which is starting up at a little expo and then working my way through that. So, looks great. open up a
1:51:571 heure, 51 minutes et 57 secondesfresh terminal for me. Um, and then run the Expo server. I'll take a QR
1:52:051 heure, 52 minutes et 5 secondescode pick and then use that to open on my phone. Make sure it's a fresh terminal, eg not inside of this thread, but actually on my computer terminal.
1:52:171 heure, 52 minutes et 17 secondesOkay, I just have to add that extra context because I've noticed the last two times that I've done this, it's repeatedly launched a terminal inside of
1:52:241 heure, 52 minutes et 24 secondesit. Okay, so this looks pretty good to me. I'm just going to zoom way in. Let's go Y. And what this is doing, if I just zoom in, this will go through the
1:52:331 heure, 52 minutes et 33 secondesprocess of what looks like installing a tunnel. Okay, now after we sorted that
1:52:401 heure, 52 minutes et 40 secondesout, I'm now opening up the Expo app just like I did before. And understand that building and doing it on your phone, it's a very different process
1:52:481 heure, 52 minutes et 48 secondesthan building and doing it on your computer, of course. And so it may not work right off the get- go. And I'm already seeing a couple of errors which I will show you guys u right now by
1:52:561 heure, 52 minutes et 56 secondesrunning this iPhone mirroring app just so you guys can see it with me. I'm not going to do the debug after this just because hopefully you guys understand the debugs tend to be pretty similar.
1:53:041 heure, 53 minutes et 4 secondesBut it looks like we still have the icon um getting cut off error. So that's one thing that we need to fix. So I'm actually just going to open up a little um window here. And this window is going
1:53:131 heure, 53 minutes et 13 secondesuh a little transcript window here. And then I'm just going to fire off all the changes.
1:53:181 heure, 53 minutes et 18 secondesOkay. So, the first problem is the icons are all cut off uh halfway through for
1:53:261 heure, 53 minutes et 26 secondeswhatever reason. It's like the heads of the icons are all cut off.
1:53:331 heure, 53 minutes et 33 secondesI think this is a mobile specific issue. I'm not seeing it happen anywhere else.
1:53:381 heure, 53 minutes et 38 secondesIt's not on the local Chrome when we run it. It's always just on mobile. I see this with the little star uh emoji
1:53:461 heure, 53 minutes et 46 secondesinitially. I see it with the confetti emoji on the uh today page. I'm seeing
1:53:541 heure, 53 minutes et 54 secondesit on and off across the other pages as well. So, this is telling me there's just some issue with how the icons and emojis are sort of being formatted.
1:54:041 heure, 54 minutes et 4 secondesNow, while I was testing, I kept on getting this error here. Commander failed to start tunnel. And basically what ended up happening was after you
1:54:121 heure, 54 minutes et 12 secondesmake a certain number of servers with a particular service, um, it suspends you and basically says, "Hey, can you verify your email? We want to make sure you're not spammers." And so I I kept on like
1:54:211 heure, 54 minutes et 21 secondesbanging my head against the wall. I was like, "Hey, what's going on? What's going on? What's going on? What's going on?" The um debug loop of that was literally me just copying this in
1:54:301 heure, 54 minutes et 30 secondesand then pasting this right here. And after I did this three or four times, I just naturally and sort of inherently found the issue. So that's what I did up
1:54:371 heure, 54 minutes et 37 secondeshere. And then it ended up saying, "Hey, found it. your Enro accounts needs email verification. So now I'm going to open this up. We just have to verify my
1:54:441 heure, 54 minutes et 44 secondesemail. So I don't I don't actually know if I have an account and I'm just going to go back here and then probably set one up. Let me see.
1:54:541 heure, 54 minutes et 54 secondesOkay. And then after verifying my email, I have the thread back up. So I can then just take a screenshot of this or rather open this up in my camera and just repeat the exercise.
1:55:041 heure, 55 minutes et 4 secondesSo, I leave this part of the video in not because I think it's going to win me any engagement points, but just because little weird stuff like this happens when you program and develop things.
1:55:131 heure, 55 minutes et 13 secondesJust is how it is. I think most people would like to eliminate that from their videos and tutorials so that you think it's a lot easier than it is. But just
1:55:211 heure, 55 minutes et 21 secondeslike little pieces of friction and stuff like that. From time to time, this will consume your tokens. This will cause your rate limit to stop and stuff like that. The most important thing is not
1:55:291 heure, 55 minutes et 29 secondeslike will I run into a bug because I'll be honest, you are going to run into a bug. The thing to remember is when I run
1:55:381 heure, 55 minutes et 38 secondesinto a bug, keep a cool head. It's not the end of the world. I am literally talking to intelligent sand right now.
1:55:451 heure, 55 minutes et 45 secondesSo, it would be kind of unreasonable to expect that there wouldn't be some sort of problem with some server or whatnot.
1:55:501 heure, 55 minutes et 50 secondesAnyway, I now have it open on my actual phone. So, I'm just going to run through a testing loop on on my phone because um I just finished up with this and uh I'll
1:55:581 heure, 55 minutes et 58 secondeslet you know how the push notifications and everything like that go. Just not going to leave this in because you're just going to be staring at me clicking on the screen. And it looks like everything is working good on the phone
1:56:061 heure, 56 minutes et 6 secondesend. We get the push notifications. Uh although I did have to enable that manually in the settings. I also have the ability to swipe them away and you
1:56:131 heure, 56 minutes et 13 secondesknow they sort of come in at odd intervals. Uh I have the ability to trigger them. So, for instance, I triggered one on my phone to occur right now. And then I saw it pop up at the
1:56:221 heure, 56 minutes et 22 secondestop. Really, the only last thing to test if you wanted to make sure that this worked 100% of the time would be um some sort of like scheduling. So, you need to
1:56:301 heure, 56 minutes et 30 secondesask Claude to set one to show up on your phone, let's say, at a particular time.
1:56:341 heure, 56 minutes et 34 secondesSo, maybe in my case, that would be, I don't know, like 12 or or 123, let's say, 1 minute from now. And I just have to sit there sort of staring at my phone to make sure that, you know, that works.
1:56:451 heure, 56 minutes et 45 secondesAnd assuming that the notification pops up, awesome. Everything's good to go. If not, there are a couple of things that you're going to have to uh uh do before
1:56:511 heure, 56 minutes et 51 secondesthen, obviously. Okay, so that's that for actually building in AI functionality and API calls into the app. Hopefully, you guys see it's not
1:56:591 heure, 56 minutes et 59 secondesactually all that difficult. It's more or less the exact same thing that we were doing before, just talking Claude and coaching it through, solving some problems for us. Uh what I want to talk
1:57:071 heure, 57 minutes et 7 secondesabout now is you know before we actually deploy this and then push this to you know a place like the app store there's just one final step and that final step
1:57:161 heure, 57 minutes et 16 secondesis one that I think like 99% of people in our vibecoded economy nowadays are going to skip because it takes some time and it's not very sexy. Uh but it's it's
1:57:251 heure, 57 minutes et 25 secondesthat 1% I think of people that do that ultimately have apps that that end up going somewhere making them a fair amount of money and you know being used
1:57:321 heure, 57 minutes et 32 secondesby by thousands or millions. And that step is security. You know, if your app is uh security dumpster fire, you may
1:57:401 heure, 57 minutes et 40 secondeshave some people start to use it, but when all of their data gets, you know, horrifically leaked, when their usernames and passwords or whatever go into the the the dark web, ether,
1:57:481 heure, 57 minutes et 48 secondeswhatever the hell, you know, essentially when they get compromised, um you'll completely murder any sort of reputation that you might have built uh with setup.
1:57:561 heure, 57 minutes et 56 secondesBut more importantly, you're also exposing yourself to massive like fiduciary uh liabilities. you're exposing yourself to issues like people
1:58:041 heure, 58 minutes et 4 secondesleaking your API token and then running up your and then other users accounts to millions if not tens of millions of dollars. We've seen this sort of thing
1:58:111 heure, 58 minutes et 11 secondeshappen actually at scale here and these big providers are only sort of like loosely able to uh reimburse you or subsidize you for some of that token
1:58:191 heure, 58 minutes et 19 secondesusage because at the end of the day it is your fault. Um there's a lot more as well if you think about like government regulations surrounding particular types
1:58:261 heure, 58 minutes et 26 secondesof sensitive data. Now, in our case, we're dealing with a habit tracker, but if you're dealing with somebody's like personal health data or, you know, personal financial data, or if you're
1:58:341 heure, 58 minutes et 34 secondesusing maybe some open authentication connector that uh connected to something that allowed people to sign into their bank accounts, you know, if that info
1:58:411 heure, 58 minutes et 41 secondesgets leaked, you can be on the hook for quite the pretty penny. And so, I'm not a lawyer, and this isn't legal advice.
1:58:461 heure, 58 minutes et 46 secondesI'm also not a computer security specialist or anything like that, although I think that would be a pretty cool career now that I uh now that I come to to think of it. What I am is I'm
1:58:551 heure, 58 minutes et 55 secondesjust a guy that's interested in getting the biggest bang for my buck. And the way that you do that, at least with AI, for vibecoded apps, especially mobile
1:59:021 heure, 59 minutes et 2 secondesapps, is you just have a prompt that you feed Claude that methodically and consistently checks all of the major
1:59:091 heure, 59 minutes et 9 secondeslowhanging fruit in your security. The reality is us as, you know, solo devs or even working within a team are very unlikely to make something 100% secure.
1:59:181 heure, 59 minutes et 18 secondesAnd you best bet, even if you think it's 100% secure, it's not. there's probably still some sort of loophole or problem.
1:59:241 heure, 59 minutes et 24 secondesWhat we can do though is we can eliminate, you know, the 8020. We can eliminate all of the lowhanging fruit that, you know, attackers and then also
1:59:321 heure, 59 minutes et 32 secondesuh platforms typically use in order to uh, you know, compromise your data and ultimately land you in hot water. And I
Chapitre 23 : Security Risks in App Development
1:59:401 heure, 59 minutes et 40 secondesmean, anytime you start any business or build any sort of app or help use any sort of technology, you're always going to be facing some form of risk. So my goal is not to eliminate the risk
1:59:481 heure, 59 minutes et 48 secondescompletely because as mentioned, I think that's impossible. But what we can do is we can eliminate a fair amount of that risk and then just get it to the point where somebody would look at your app
1:59:551 heure, 59 minutes et 55 secondessay, "Okay, that's actually pretty secure. I don't really think that's worth hacking. Let me just move on to the next one that's a little less secure." Right? So, what I'm going to do now is show you a simple and
2:00:042 heures et 4 secondesstraightforward security prompt that you could use only on apps that have gone through all three prongs of this testing procedure. Um, you know, so, uh, Chrome,
2:00:112 heures et 11 secondeslet's say, or whatever your browser of choice is, Expo, and then ultimately like actually testing it on your phone in Expo. Um, and once all of that is
2:00:182 heures et 18 secondesdone and you've 100% verified that like the app is basically ready to launch, uh, you would you would run the security prompt audit like I'm showing you. And I also want you guys to know that this
2:00:262 heures et 26 secondesisn't the only thing you can use. It's just one of many types of security audit prompts. The most important thing is not to get it 100% correct. The most important thing is just to do it because
2:00:342 heures et 34 secondesby doing it, you will, as mentioned, at least make some progress towards the goal of ultimately being more secure. So what is this prompt? Let me show you.
2:00:432 heures et 43 secondesOkay, just zooming in so you guys could see this. This was posted in one of my older courses uh specifically in a module called security for vibecoded apps. So what I'm going to do now that
2:00:522 heures et 52 secondesI'm done with everything is I'm just going to scroll all the way down to the bottom. As you can see it's pretty chunky. It's pretty large and I'm just going to go back to claud and I'm going
2:01:002 heures et 1 minuteto feed that in. So I'm now uh before I run this sorry I'm I'm going to clear all of my conversation history. So I'm
2:01:082 heures, 1 minute et 8 secondesrunning with a fresh instance of cloud that doesn't have any of the context uh of our prior conversation. And now that we're down to zero tokens again, I'm just going to commandV, paste in this
2:01:172 heures, 1 minute et 17 secondesgiant string, and just have it go on its way. And so basically what this thing is, if I show you guys a couple of key points,
2:01:252 heures, 1 minute et 25 secondesis it is a comprehensive list plus formatting of ways to identify and then
2:01:342 heures, 1 minute et 34 secondessolve the major low-hanging fruit, which typically involves specific vulnerability patterns like hallucinated packages, missing serverside validation,
2:01:432 heures, 1 minute et 43 secondesdefault open database policies, hard-coded secrets, and inconsistent O middleware uh for your mobile app. So, you know, as mentioned, you don't need
2:01:522 heures, 1 minute et 52 secondesto know what's going on under the hood here, and you're not going to be able to 100% solve all security, but you'll get pretty close. And then after what we do
2:02:002 heures et 2 minutesis we basically have it rank it in um a big tier list here alongside the security finding number. So you'll see there'll be a lot of security findings,
2:02:072 heures, 2 minutes et 7 secondesmaybe like 50 or 60 or something. And it's just going to go methodically top to bottom telling us whether or not we have a critical severity, high severity, medium severity, or low severity
2:02:152 heures, 2 minutes et 15 secondesvulnerability, what sort of category it is, the location of it, and then the uh uh CWE, which I think is a particular
2:02:222 heures, 2 minutes et 22 secondesacronym uh that I'm forgetting that deals with uh security. Yeah, it's called common weakness enumeration, which is basically just a list of the
2:02:302 heures, 2 minutes et 30 secondescommon ways that people usually get access to apps. Okay, so I'm not going to run through absolutely everything.
2:02:362 heures, 2 minutes et 36 secondesWhat I'm going to do instead is I'm just going to show you guys what the actual output is. And you'll see that there are actually a fair number of vulnerabilities already, which kind of sucks. So, scrolling up all the way to
2:02:452 heures, 2 minutes et 45 secondesthe very very top of this. Okay. Um, you could see that we've passed the hard-coded secrets uh vulnerability.
2:02:522 heures, 2 minutes et 52 secondesThat's great. What that means is we're basically just not pasting our API key anywhere but in this file right over here or in Superbase itself. Git ignore
2:03:012 heures, 3 minutes et 1 secondecoverage though is partial. And so that's something that we can fix. Public prefix leaks. Okay. So we are past that.
2:03:092 heures, 3 minutes et 9 secondesConsole error leaks partial. Okay.
2:03:122 heures, 3 minutes et 12 secondesStartup validation is a complete and utter fail. Okay. And because it's a complete and utter fail, it's obviously something we're going to have to fix.
2:03:182 heures, 3 minutes et 18 secondesUm, you know, just scrolling through here, there are very few that are 100% fails. Most of these are partials, which is good. Protected API routes, for instance, that's a major fail, and
2:03:262 heures, 3 minutes et 26 secondesthat's actually um kind of chunky. So, I'm glad we sorted that out. Error information leak. So there's a lot of uh info that comes out when
2:03:362 heures, 3 minutes et 36 secondesyou know we run like a console script or something like that. So we're going to fix that. Expensive operations. So there are some things that are pretty
2:03:442 heures, 3 minutes et 44 secondesexpensive and this basically says that an attacker if they just wanted to take us down could run this sort of thing over and over and over and over and over again to burn our claude tokens. there's
2:03:532 heures, 3 minutes et 53 secondessome other, you know, issues and so on and so forth. But basically, once we've loaded all this stuff in, I'm going to ask it, okay, great. Run through and fix
2:04:012 heures, 4 minutes et 1 secondeall of these errors end to end. After you're done, test and ensure they're 100% solved.
2:04:102 heures, 4 minutes et 10 secondesOkay? And the first time that you run this and then have it, you know, solve these problems, it'll go through and it'll say, "Hey, I just solved all these problems. You're good to go." But we're
2:04:192 heures, 4 minutes et 19 secondesnot just going to run this once. What I've come to realize is that sometimes in solving one problem, it creates another somewhere else. And so after we
2:04:272 heures, 4 minutes et 27 secondessolve this first run through, I'm actually just going to clear it and then run a totally new prompt again to see if a future version of Cloud can spot
2:04:352 heures, 4 minutes et 35 secondesissues that a past version of Cloud has created. Once we're done with that, okay, after we did two, I'm like 90%
2:04:422 heures, 4 minutes et 42 secondessatisfied with most of the security um alterations.
2:04:462 heures, 4 minutes et 46 secondesObviously, if you're a big CS security guy, you're probably over here shaking your head and you're like, you should be manually going through all the code yourself and so on and so forth. But, I mean, the whole idea behind AI is to massively multiply my leverage, right?
2:04:562 heures, 4 minutes et 56 secondesSure, I could 100% verify that every line in this code is written in a specific way, but even human beings make mistakes. And so, me going through all
2:05:042 heures, 5 minutes et 4 secondesof that manually is unlikely to be much better than me doing a couple of passes of this. Now, if you are launching an app and scaling it to hundreds of thousands of users, of course, maybe
2:05:122 heures, 5 minutes et 12 secondesthat's a little bit different. And I'd recommend uh you know actually having like a whole team of people that review things and so on and so forth just to
2:05:192 heures, 5 minutes et 19 secondesminimize your actual attack surface. But in my case all I'm going to do is I'm going to go back to the top of this prompt and I'm just going to paste it in
2:05:272 heures, 5 minutes et 27 secondesagain a second time. Okay. So I'm going to let that run one more time. I'm going to see if there are any additional issues. And uh again it has no context
2:05:352 heures, 5 minutes et 35 secondesof the former fixes. So it's just going to see and and identify any new generated vulnerabilities or ones that the previous one couldn't catch. And you
2:05:422 heures, 5 minutes et 42 secondescan see a lot of the previous failures are now either passes or partials. And so the get ignore coverage for instance uh that hasn't changed. The startup validation went from fail to partial.
2:05:522 heures, 5 minutes et 52 secondesSeverities are now low. Same thing with a couple of these other ones like schema validations and um you know unused dependencies and so on and so on and so
2:06:002 heures et 6 minutesforth. Same thing with the uh expensive operations as well. I'll say great work. Fix all things even if they're partial.
2:06:112 heures, 6 minutes et 11 secondesOnce sorted, let me know if the changes produced new vulnerabilities.
2:06:172 heures, 6 minutes et 17 secondesAnd we'll just go through same thing top to bottom. And at this point, we've gotten basically as far as we can in app development without actually pushing this to the app store. Uh there are a
2:06:252 heures, 6 minutes et 25 secondesfew ways that you could test this further on your device if you wanted to like actually have a little app widget that you clicked on that immediately opened your app. Um the way that we're
2:06:332 heures, 6 minutes et 33 secondescurrently doing it, Expo is the freest and it's the straightest line path to doing so. It also doesn't take any time.
2:06:392 heures, 6 minutes et 39 secondesUm, but if you wanted to run this, let's say on an iOS device, uh, you could sign up for test flight at this point, which is a specific like Apple developer
2:06:462 heures, 6 minutes et 46 secondesprogram where you submit the app to a review team. The team reviews it within 24 hours and then you have the ability to give, I think up to like a,000 or 10,000 users a link to the app just to
2:06:552 heures, 6 minutes et 55 secondeslike test and so on and so forth. U, we're not going to do that because I think Expo covers the 8020. What we're going to do is I'm just going to move on to building a bunch more apps now with
Chapitre 24 : Transitioning to New App Features
2:07:022 heures, 7 minutes et 2 secondesyou now that we understand the the the full way through. I'll level them up, make them significantly more complex and also sexy. And then finally, we'll get to the end of the the course, I'll I'll
2:07:112 heures, 7 minutes et 11 secondesactually submit the apps directly to the app store. And then after the review period, I'll I'll, you know, run them on my phone and so on and so forth just to make sure that it's 100% good. Okay,
2:07:192 heures, 7 minutes et 19 secondeslet's move on to our next app, which is going to take all the same sort of functionality that we built with these apps. Uh, so you know, the ability to
2:07:262 heures, 7 minutes et 26 secondesadd things to a database, the ability to read things from that database, the ability to do things like push notifications on your phone, the ability
2:07:342 heures, 7 minutes et 34 secondesto have AI run synchronously, uh, you know, while you're using the app, as well as while you're not using the app to generate notifications and so on and
2:07:422 heures, 7 minutes et 42 secondesso forth. Uh, the ability to connect with OOTH providers and also do authentication through Superbase. And then also the ability to contact and work with however many APIs you need.
2:07:522 heures, 7 minutes et 52 secondesLet's take all that same functionality, but let's combine it in a much slimmer and tighter and faster and sexier form package. Uh, which I'm going to do in
2:08:002 heures et 8 minutesthe guise of a Cal Tracker app, very similar to Cal.ai, that app that recently sold for between $50 to $100 million. So, let me run you guys through exactly how all that's going to work.
Chapitre 25 : Building the CalTracker App
2:08:092 heures, 8 minutes et 9 secondesAll right. Now that we've done one core app walkthrough and I've shown you guys the general highle process of walking
2:08:162 heures, 8 minutes et 16 secondesthrough like an MVP all the way to an actual finished product, a live app that works on your cell phone, mind you
2:08:242 heures, 8 minutes et 24 secondeswithout the app store bit, which I'll get into at the end of this course.
2:08:282 heures, 8 minutes et 28 secondesLet's standardize it and let's create a couple of additional apps in a much more accelerated fashion. So the very first thing we have to do is, you know, we
2:08:362 heures, 8 minutes et 36 secondeshave to actually um standardize or outline the framework. And so what I'm going to do here is I'm just going to call this app design framework and then
2:08:452 heures, 8 minutes et 45 secondesI'm just going to walk you through more or less everything that we've actually done in order to get this far. So if you think about it, the first thing we have to do is we have to do MVP ideation. And
2:08:542 heures, 8 minutes et 54 secondesthe MVP ideation is basically just this right over here, right? We need to come up with the one thing. Map the action to reward cycle. Add only what supports the
2:09:022 heures, 9 minutes et 2 secondesloop. Ensure that there are only five to maybe seven screens total. then have some sort of like retention hook that keeps people using the app. So, we'll do
2:09:112 heures, 9 minutes et 11 secondesthat for our next one. But basically, what I'm saying is you have to start with the MVP ideation. If you don't at least have a rough idea of what you're building before you start building, you're probably not going to have a very
2:09:202 heures, 9 minutes et 20 secondesgood time. Okay? And after the MVP ideation, what we have to do is we have to build. Now, that building process a
2:09:272 heures, 9 minutes et 27 secondeslot of the time ends up just being, you know, use a voice transcription tool like I'm using down over here. And then you just dump it in. Uh have Claude run
2:09:342 heures, 9 minutes et 34 secondesthrough at least one build and then you have something that's kind of workable.
2:09:382 heures, 9 minutes et 38 secondesNow I'm going to add one additional step between build and then test. Uh and that's going to be to design. Now in the habit tracker app, you know, I thought I
2:09:472 heures, 9 minutes et 47 secondesjust come up with like a reasonable quality design initially and I didn't really express very many opinions. But once you have the core sort of local app
2:09:552 heures, 9 minutes et 55 secondesfunctionality built, it's very easy to take that functionality and just say, "Hey, I want you to, you know, take the same layout, but then apply different styles to it. Make it thematically
2:10:032 heures, 10 minutes et 3 secondesdifferent or I want it to look like this other app or maybe this website or I want it to have the feel of Apple or maybe, you know, Google or something like that." And basically, Cloud will
2:10:122 heures, 10 minutes et 12 secondesvery quickly and easily be able to spin the design in as many different ways as you want. There's actually a whole emerging class of SAS businesses that just take pre-existing app
2:10:202 heures, 10 minutes et 20 secondesfunctionality. So apps that other people have built and then just tweak or spin the design five or 10 different ways moving around icons and stuff like that so that it's more uh you know agreeable
2:10:292 heures, 10 minutes et 29 secondesto to a certain subset of users. So I'm going to show you guys how to do that.
2:10:342 heures, 10 minutes et 34 secondesAnyway, after you've designed obviously we need to test and our testing protocol actually consists of three uh smaller steps. The first step is obviously we
2:10:422 heures, 10 minutes et 42 secondeshave to do this on our um computer. And so, you know, whether you're doing a iOS or a Chrome, sorry,
2:10:512 heures, 10 minutes et 51 secondesan iOS or an Android app, you're probably going to want to test it on something like Chrome locally, at least if we're using React Native and Expo.
2:10:582 heures, 10 minutes et 58 secondesOnce we're done, um you can test via phone, but you can do so using a mirror.
2:11:032 heures, 11 minutes et 3 secondesAnd that's what I was showing you guys earlier with the iPhone mirroring app.
2:11:062 heures, 11 minutes et 6 secondesSimilar examples exist for Android as well. And then after you're done with the mirror, I'd recommend testing on phone and that's like your real actual
2:11:152 heures, 11 minutes et 15 secondesphone. And the reason why is because, you know, it's very easy to standardize testing on the computer and then just get it over and done with. And if you catch an issue here, then you can solve
2:11:232 heures, 11 minutes et 23 secondesit before propagating down to the mirror and then ultimately the real phone. Um, when you do mirror testing, it's usually a lot easier again just to quickly swipe
2:11:312 heures, 11 minutes et 31 secondesthrough um using, you know, functionality and and and uh uh usability that you already understand.
2:11:362 heures, 11 minutes et 36 secondesAnd so I don't know using your little scroll wheel and going up and down clicking on things with the computer and stuff. You're also not kind of going between devices so you save a bit of
2:11:442 heures, 11 minutes et 44 secondestime. Then finally at the end you know you actually go all the way down the stack and test with your phone because as mentioned there are a couple of key pieces of functionality you just can't
2:11:512 heures, 11 minutes et 51 secondesget on the computer. Uh and that is things like push notifications for instance or like haptic feedback which you can't get on the mirror as well. And so basically after we're done with this
2:11:582 heures, 11 minutes et 58 secondestest, okay, we add a database because everything up until now has just been done locally.
2:12:052 heures, 12 minutes et 5 secondesthat database will also include some form of O. Okay. And so in our case, you know, we're using um Superbase and and so on and so forth. That's actually
2:12:142 heures, 12 minutes et 14 secondesreally easy. You guys have already seen me do that once. And then after you add the database, because we've now fundamentally changed the way that the app works, we've also introduced a lot
2:12:222 heures, 12 minutes et 22 secondesof opportunities for failure, right? You know, database is fundamentally going to work a little bit differently. Those are sending requests over to another server.
2:12:302 heures, 12 minutes et 30 secondesuh and you know in the case of implementing like an onoff mechanism for instance there may be some friction when like you use Google signin or I don't even email and password signup so what
2:12:392 heures, 12 minutes et 39 secondesyou do after you add the database is you have to test again and this test again is basically going to be the exact same thing that we did over here so very straightforward we're basically just
2:12:482 heures, 12 minutes et 48 secondesrepeating this process and then afterwards you're going to want to do a security audit and that audit is necessary because you know back over here if you think about it we were doing
2:12:562 heures, 12 minutes et 56 secondesstuff locally but after adding the database and the authentication stuff like that Now, this is technically this is technically live. This is something that's like occurring on the internet
2:13:032 heures, 13 minutes et 3 secondesand anybody could use it. And after we're done with the security audit, if you think about it, the last thing we do is we do a third end toend test
2:13:122 heures, 13 minutes et 12 secondesand then we deploy. And I'm using the term deployment here. Um, sort of generally this could include submitting to the app store. It could include
2:13:202 heures, 13 minutes et 20 secondespushing your your app to like, you know, a live uh production repository on GitHub or something like that if it's already up and running. uh whether
2:13:272 heures, 13 minutes et 27 secondesyou're implementing a whole app or a new feature, this is the exact same flow.
2:13:312 heures, 13 minutes et 31 secondesBasically, you just repeat it over and over and over and over again. And so in our case, that last deploy feature, which I'm going to show you guys at the end, is going to involve bundling our app up into a nice sexy package and then
2:13:392 heures, 13 minutes et 39 secondesactually submitting it to the the app store. Okay, so what am I going to do now? I'm just going to duplicate the same flow another two times to show you fundamentally different types of apps,
2:13:472 heures, 13 minutes et 47 secondesapps that now, you know, use your camera apps that have like way different functionality. And uh we're just going to run through this a couple of times just to really get that muscle in. Okay.
2:13:562 heures, 13 minutes et 56 secondesSo, the very first thing we need to do for our next app is MVP ideation. So, what I'm going to do is I'm just going to move this down here. And I'm just going to brainstorm the next app that I
2:14:052 heures, 14 minutes et 5 secondeswant to build. And this is me kind of cheating. But basically, the next st uh stack I want to build is sort of like a Cal AI lookalike.
2:14:142 heures, 14 minutes et 14 secondesAnd the reason why is because um you know, as mentioned, this app sold for $50 to $100 million. And I also think it's like a great example of using AI functionality. Essentially, the way that
2:14:222 heures, 14 minutes et 22 secondesit works, and you can see the number of screens is pretty limited here. Um, this just tracks your calories on a day-to-day basis. And it's actually not that fundamentally different from our
2:14:302 heures, 14 minutes et 30 secondeshabit tracker. Just stay with me here for a sec. You know, we have some sort of daily log. On that daily log, we have a certain number of calories that like
2:14:372 heures, 14 minutes et 37 secondeswe desire eating. And so, typically, you'd set that up in some sort of onboarding screen just like you'd select your habits. Uh, you know, as the day
Chapitre 26 : Core Functionality of CalTracker
2:14:442 heures, 14 minutes et 44 secondesgoes on, you can add or track different things. That'll fill up the number of calories just like it fills up our challenge goal. Uh the only real
2:14:522 heures, 14 minutes et 52 secondesadditional piece of functionality is we're just going to be sending pictures of what it is that we're scanning over to AI. And uh the way that Cal AI works
2:15:002 heures et 15 minutesis they also hook up to like a couple of databases that have barcodes and food labels and stuff like that. I'm just going to leave that functionality out because I think the core loop really is
2:15:082 heures, 15 minutes et 8 secondesthat take a picture of your food and get the estimated number of calories. And you know, I should note that this core piece of functionality is reasonably accurate, but it's still plus or minus
2:15:162 heures, 15 minutes et 16 secondesmaybe 10 to 15% calories. there just a lot of things that AI can't know about foods like you know how deep the dish is and stuff like that. So um you know
2:15:242 heures, 15 minutes et 24 secondeswe're not actually expecting this to be 100% accurate with calorie trackers.
2:15:272 heures, 15 minutes et 27 secondesWe're just using the state-of-the-art functionality and getting about as good as these guys get with theirs. Okay. And then obviously after you take a photo you can see the calories. You can track
2:15:362 heures, 15 minutes et 36 secondesyour progress. Notice how they have very few screens. This says home. This says progress. I think this says groups and that says profile although it's kind of blurry for me. And then uh you know they
2:15:442 heures, 15 minutes et 44 secondesalso have some social sort of functionality and I'm probably going to leave that part out. Okay, so the core app loop, it's basically going to be right over here. We're going to grab
2:15:512 heures, 15 minutes et 51 secondesthese four and I'm going to run you guys through what that process looks like.
2:15:552 heures, 15 minutes et 55 secondesAnd then for design, we're just going to like flip the design a little bit. It'll look a little bit different. Uh maybe even a little bit better. Who knows?
2:16:012 heures, 16 minutes et 1 secondeOkay, so I'm now just going to voice dump all of this into one big prompt. So I'm going to double tap here. I'm using an app framework where I define a core
2:16:102 heures, 16 minutes et 10 secondesfunction, then a core loop, then accessory features, then minimize the surface area, and then finally add some sort of retention hook at the end. My
2:16:172 heures, 16 minutes et 17 secondesgoal is to build an app similar to Cal AI. My core function will be the ability to track your calories and then take a
2:16:262 heures, 16 minutes et 26 secondesscreenshot of a piece of food, have that sent over to an AI image processor, and then return the probable number of
2:16:332 heures, 16 minutes et 33 secondescalories as well as macronutrients. From there, we can add calories to our daily, you know, goal, uh, alongside protein,
2:16:402 heures, 16 minutes et 40 secondescarbs, and then fats. The main action to reward cycle will revolve around hitting your calorie goals on a day-to-day
2:16:482 heures, 16 minutes et 48 secondesbasis, as well as your macro goals. Um, and also some sort of like visual stimulation every time you track and actually add something to the app
2:16:562 heures, 16 minutes et 56 secondesbecause again, the whole idea is we want to have users return to the app over and over and over again every time they they want to log a meal. In terms of
2:17:042 heures, 17 minutes et 4 secondesaccessory features, we want a couple of things. We want the ability to uh track your progress. So, you need to be able to visualize this, see it sort of laid
2:17:112 heures, 17 minutes et 11 secondesout in front of you in a chart type view. Uh you need to have a calendar which sort of goes back over time so you can see what previous logged entries
2:17:192 heures, 17 minutes et 19 secondeswere. You obviously need some sort of log in general. So, the user should be able to see everything that's going on uh historically with all of their their
2:17:262 heures, 17 minutes et 26 secondesuh calorie tracked features. You should be able to have a clean interface where I take the photo uh and then send it over. And then you should have some nice
2:17:352 heures, 17 minutes et 35 secondessexy homepage that, you know, talks about all the various features that most people usually have in an app like this.
2:17:402 heures, 17 minutes et 40 secondesTerms of surface area check, we're aiming for somewhere between three to four screens. You know, we're probably going to want to have a home screen, which at a glance shows most of the functionality. We're going to want the ability to take a photo of the calories.
2:17:512 heures, 17 minutes et 51 secondesAs mentioned, um, you're there's going to be some screen that pops up after you take the photo with the perceived nutritional information. The user should
2:18:002 heures et 18 minutesbe able to make minor adjustments to that, maybe increase the calories or protein or whatever the heck, because sometimes um, AI calorie tracking functionality via photos is not
2:18:092 heures, 18 minutes et 9 secondesaccurate. And then finally, there needs to be a screen that allows them to track their progress, too. Uh, you should probably also add a settings page, uh,
2:18:162 heures, 18 minutes et 16 secondesassuming that doesn't bump us over the 5 to 7 max screen limit. And then for retention hook, you're just going to want to add push notifications to the
2:18:242 heures, 18 minutes et 24 secondesapp to bring people back repeatedly. Um, you know, hey, have you tracked your breakfast yet? Have you tracked your lunch yet? Have you tracked your dinner yet? And so on and so forth, as well as
2:18:322 heures, 18 minutes et 32 secondesperiodic notifications congratulating people on streaks. So build some sort of streak functionality in as well. We'll do all of this locally to start and then
2:18:412 heures, 18 minutes et 41 secondeseventually migrate this over to uh, you know, a database later. Okay. And then all we do is I'm just going to zoom in here. We're going to go new window.
Chapitre 27 : Designing the CalTracker Interface
2:18:502 heures, 18 minutes et 50 secondesAnd then I'm going to open folder. And then instead of habit tracker, I'm going to call this cal tracker. As you can see, we're big on the trackers. We're just going to repeat the exercise. So,
2:18:582 heures, 18 minutes et 58 secondeslet me make this nice and pretty so you can see what I'm doing. Double tap on the page, open up Claude, and then this is where we're going to store all of our files and so on and so forth. Now, just
2:19:072 heures, 19 minutes et 7 secondeslike I did before, um I mentioned that uh you know, we we basically have Claude guide us through the expo setup. I'm
2:19:132 heures, 19 minutes et 13 secondesgoing to build a mobile app using Claude um Expo and React Native. Should work on
2:19:212 heures, 19 minutes et 21 secondesall devices. Scaffold me out the workspace in the current folder. Again, we don't actually have to do any of that
2:19:292 heures, 19 minutes et 29 secondesdownloading or anything like that ourselves. It'll actually just go through and do it all. And I should note, you could also just duplicate your habit tracker folder if you want to. Um and it'll just it'll scaffold it out
2:19:372 heures, 19 minutes et 37 secondesvery similarly to the habit tracker. You can then say like, "Hey, I want you to make some adjustments to this repo.
2:19:412 heures, 19 minutes et 41 secondesHere's the new app." And so on and so forth. I'm just trying to approach it from like a token minimization standpoint. And I also want to show you guys how easy it is to like create a totally new app every time. It's very
2:19:492 heures, 19 minutes et 49 secondesstraightforward. Okay. So, you can see that this is what it's doing.
2:19:522 heures, 19 minutes et 52 secondesScaffolding the expo project with TypeScript, filebased routing, and crossplatform support. Uh, I'm just going to wait until all this stuff is good to go. And now I'm just going to
2:20:002 heures et 20 minutespaste in my giant prompt. And um, because the voice transcript tool I'm using just allows me to like kind of keep it in my clipboard. I just held command and pressed V. Now I have the
2:20:082 heures, 20 minutes et 8 secondesentire app. So you can see here it uh is going to take this start scoping the functionality and then actually build me my little MVP/demo.
2:20:162 heures, 20 minutes et 16 secondesI'll circle back when this is done. All right, we've now passed our TypeScript test with zero errors. That basically means that uh the code is technically
2:20:252 heures, 20 minutes et 25 secondescompiling. It's technically finishing which is nice. That doesn't actually mean that the app works for sure though.
2:20:292 heures, 20 minutes et 29 secondesSo what we need to do is we need to actually test this locally on our computer. So I'll say uh run this locally on my computer. I want to test via Chrome.
2:20:392 heures, 20 minutes et 39 secondesLooks like we also need to add our anthropic API key in settings to enable AI food photo analysis. Now, it would be nice to use totally new not expiring
2:20:482 heures, 20 minutes et 48 secondeskey. Uh I can't because you know you can't actually like take a look at this once you've created it. They only allow you to do so once. So, I'm just going to create a new one in my current
2:20:562 heures, 20 minutes et 56 secondesworkspace. And I'm just going to call it uh Cal Tracker app. Okay. We'll go add.
2:21:022 heures, 21 minutes et 2 secondesWe'll copy that key over. Then I'll go back over here. And then I'll say this is my key. I'm just doing it because I'm I'm going to want to actually test all
2:21:102 heures, 21 minutes et 10 secondesthat functionality. We're probably not going to be able to take a a photo with our camera, unfortunately. But um all good. Store this in aenv. And you know,
2:21:182 heures, 21 minutes et 18 secondesyou can see sometimes it'll actually say don't paste the API keys in the chat. Again, I'm just sort of skipping a step.
2:21:232 heures, 21 minutes et 23 secondesYou can go here, go env, and then create one. Um it just did right over here, which is nice. Okay, great. So with all that said, if I now go back to the
2:21:312 heures, 21 minutes et 31 secondesactual app, you can see it's open right over here.
2:21:342 heures, 21 minutes et 34 secondesSo, let me see what this would actually look like. And note the design is still quite low quality, obviously, because we haven't done any um sort of customization or anything like that.
2:21:432 heures, 21 minutes et 43 secondesOkay, we have it open. I'm just going to zoom in a bit more so you guys could see. 200% I think is reasonable.
2:21:492 heures, 21 minutes et 49 secondesAnd as you see, the very first thing we have is we have this 2,000 remaining calories. We then have protein, carbs, fat, and then today's log. I can click
2:21:562 heures, 21 minutes et 56 secondesthis button, take a photo or choose from gallery, which is kind of nice. Okay.
2:21:592 heures, 21 minutes et 59 secondesAnd I'm just going to grab a food uh picture. So, why don't we go plate of rice and chicken or something? I'll just
2:22:062 heures, 22 minutes et 6 secondesgrab uh I don't know, maybe this. That looks pretty easy, right? It's like pretty easily interpretable. And I'll just open this in a new tab. And I'm going to save this. And I'll say rice
2:22:152 heures, 22 minutes et 15 secondesand chicken. JPG. So, that looks pretty good. And I'm just going to pretend, you know, for the the purpose of this example that I've actually just created
2:22:232 heures, 22 minutes et 23 secondesthis uh you know, like I'm actually just taking that photo with my camera. Okay.
2:22:282 heures, 22 minutes et 28 secondesAnd we're just going to make this a little bit smaller here. I'll click take photo and it'll open up my little file finder. And now you can see we're uh coming up with an issue. This
2:22:362 heures, 22 minutes et 36 secondesvalvalidate path is not a function, but we do have half of the functionality done which is you know we can actually upload a upload a file which is cool. So
2:22:432 heures, 22 minutes et 43 secondesI'm going to say getting this when I upload an image/take and then I'll say fix. So that part's
2:22:512 heures, 22 minutes et 51 secondespretty good. I mean you know I'm sure that'll sort it out in a second but let's take a look at the progress and see how that looks. So May 2nd to May 8th. So we actually see this is probably going to be like uh some form of
2:23:002 heures et 23 minutescalendar where you can see the number of calories that you've logged which is kind of cool. Then we have our settings which is where we can adjust how many calories, how many how much protein, how
2:23:072 heures, 23 minutes et 7 secondesmuch carbs, how much fat. Then we can even enable some notifications. And you can see when I did that it said um you know should be allowed notifications. So
2:23:142 heures, 23 minutes et 14 secondesif I reload this now we can actually put um notifications on. You can see here we're also getting some sort of issue.
2:23:202 heures, 23 minutes et 20 secondesI'm saying this popped up when I accepted notifications. to fix.
2:23:262 heures, 23 minutes et 26 secondesI'm just going to dismiss this so I can see the rest of it. We also have the ability to change our thropic API key, which is quite nice. And it doesn't really look like I can exit out of this little error message. Okay, no, I can't.
2:23:362 heures, 23 minutes et 36 secondesI just need to click on that. Cool. So, while I was just testing this u me just feeding in those brief little adjustments to Claude, you know, it's saying it's actually gone ahead and
2:23:452 heures, 23 minutes et 45 secondesfixed it. So, I now go to take a photo and I upload this. How's that looking?
2:23:492 heures, 23 minutes et 49 secondesWe're seeing failed to fetch. So now when I upload it says failed to fetch fix. We're just going to work our way
2:23:572 heures, 23 minutes et 57 secondesprogressively through this until we finish. We're now going to refresh. Let me see if I could take that photo. And now we actually have the analysis
2:24:042 heures, 24 minutes et 4 secondesoccurring which is quite nice. And this is cool. This is cool. As you guys can see here, we now have the title. Roasted chicken thigh with Spanish rice, which is nice. Number of calories in total
2:24:122 heures, 24 minutes et 12 secondes650, protein 42, carbs 58, fat 26. We can actually adjust these if needed. But as you guys see, this is a very simple sort of UX, and we can we can now add
2:24:202 heures, 24 minutes et 20 secondesthat to the log. After we add, we get a cute little modal that says added to log. And then we have the number of calories remaining as well as what we filled it up with. That's really cool.
2:24:282 heures, 24 minutes et 28 secondesSo, I like I like what's gone on so far.
2:24:302 heures, 24 minutes et 30 secondesOkay. And now we have a one day streak cuz we've logged and we also have today's log. Now, what I think would be really cool is if I could click on this, I could actually go into that. So, we we
2:24:392 heures, 24 minutes et 39 secondesdon't currently have the ability to do this. And then progress. You know, we see some of these numbers are starting to double up on each other. So, that's an issue. Uh, it would be nice if I
2:24:472 heures, 24 minutes et 47 secondescould edit stuff. So, I'm going to add an edit functionality feature, which um should toggle when I give it a click.
2:24:512 heures, 24 minutes et 51 secondesAlso, the way I want this calendar is I literally want a calendar. I don't just want that. So, I'm just going to adjust all of these and feed that into AI.
2:24:582 heures, 24 minutes et 58 secondesWhile I'm at it, I'm just going to test this little meal reminder toggle.
2:25:012 heures, 25 minutes et 1 secondeDoesn't look like anything's happening right now. So, I'm going to make sure to make a note of that and then send it over. Hey, the app looks great so far. I like the core feedback loop. I should be
2:25:092 heures, 25 minutes et 9 secondesable to click on the pop-ups under today's log to edit the entries. So, make sure there's a way to do that. I'm also noticing that the text is wrapping
2:25:172 heures, 25 minutes et 17 secondeskind of weirdly. And from a design perspective, I think there are a bunch of ways we can make that better. I'd like you to comprehensively audit the design using, you know, your own local
2:25:242 heures, 25 minutes et 24 secondestesting flow. Make sure that if you add things uh and log things that you could see all the text and so on and so forth.
2:25:302 heures, 25 minutes et 30 secondesFor the progress page, I want um an actual calendar, not just a uh you know, sort of like bar chart log. I'm also
2:25:382 heures, 25 minutes et 38 secondesfinding that when you add an entry, the calorie amounts sort of overlap. Uh something about the threshold looks kind of weird and now we have a bunch of text
2:25:472 heures, 25 minutes et 47 secondeson top of uh other text. Uh we should also be able to edit the history. And really what I want is I want you to be able to click on a specific calendar day
2:25:542 heures, 25 minutes et 54 secondesand then see all of the logged items for that day. And then finally for the settings page, when I click on meal reminders, nothing happens. So I'd also like you to comprehensively audit that.
2:26:032 heures, 26 minutes et 3 secondesAdditionally, add an onboarding screen so that when a user starts the app, it runs them through sort of what their goals are, asks them whether they like
2:26:112 heures, 26 minutes et 11 secondesto lose weight, gain weight, maintain weight, build muscle, etc., all the standard run-of-the-mill stuff for calorie tracking apps, and then uses
2:26:182 heures, 26 minutes et 18 secondesthat to allow them to personalize their plan based off of uh macronutrient goals and stuff like that. Also, make sure to give them a recommended plan so that
2:26:262 heures, 26 minutes et 26 secondesthey're not just having to come up with all of it themselves. maybe have a way they can pump in like their their height and their weight and stuff to work out like some some calorie averages before
2:26:352 heures, 26 minutes et 35 secondesyou put any of those in. Actually do the research because I don't just want you to pull it out of your ass. Okay, go ahead.
2:26:422 heures, 26 minutes et 42 secondesSo, that's pretty comprehensive. I'm now just going to loop around and we'll see how it goes. All right, it just wrapped up here. It took 2 minutes and 56 seconds to implement this feature. Much
2:26:502 heures, 26 minutes et 50 secondesfaster than anything I would have been able to do on my end. Really cool seeing all this work. You can now see we have an onboarding screen that says, "What's your goal? We'll personalize your daily
2:26:572 heures, 26 minutes et 57 secondestargets. lose weight, maintain weight, gain weight, or build muscles. So, I'm going to pretend it's actually me and I'm trying to gain weight. I'll click continue. And now it's actually going to
2:27:062 heures, 27 minutes et 6 secondesask us, hey, you know, use this to calculate your daily energy needs via via the Mifflin Sture equation. That's
2:27:142 heures, 27 minutes et 14 secondesinteresting. So, male or female, I am male. Uh, let's not talk about my age, you know. Let's say I'm 62. I am seeing that like this extends a little bit to
2:27:232 heures, 27 minutes et 23 secondesthe right, unfortunately. So, I'm just going to um start logging things. Hey, I'm noticing that the height and uh foot
2:27:322 heures, 27 minutes et 32 secondesand inches markers unfortunately extend and sort of break the the page width on mobile. It just doesn't really work. So, fix that. Make them a lot tighter.
2:27:422 heures, 27 minutes et 42 secondesAnd then, I don't know, let's say I'm like 175 sedentary, lightly active, moderately active, reactive. I'm moderately active. I'm going to see my plan. And you can see it's now actually
2:27:512 heures, 27 minutes et 51 secondesgiven me my daily energy expenditure plus my daily calorie target. So, that looks pretty good. Not exactly rocket science. I can also adjust this at any point in time in settings. Let's go. So,
2:28:002 heures et 28 minutesnow I have uh you know the same calorie tracking functionality I had earlier except I can actually click in on this and you can see the name, the calories,
2:28:072 heures, 28 minutes et 7 secondesprotein, carbs, fat. I'm not seeing the image and I think the image is important. Um, you know, we'll probably end up storing a fair amount of this, but I can imagine how, you know, we could easily compress the image so at
2:28:162 heures, 28 minutes et 16 secondesleast like there's a picture of something the the thing that we sent.
2:28:192 heures, 28 minutes et 19 secondesUh, when I click on one of the pre-existing entries, I don't see the image. Uh, this may be a bug. It may also be a storage space consideration, but ideally I want to be able to see the
2:28:282 heures, 28 minutes et 28 secondesimage that I took. We could do some compression to minimize the total amount of storage required. In fact, that's probably what makes the most sense.
Chapitre 28 : Improving User Experience
2:28:362 heures, 28 minutes et 36 secondesOkay, so I'm just going to add all of this live sort of while I'm doing the rest of the check because that way we can bundle up and, you know, be be efficient. And here I can actually move
2:28:452 heures, 28 minutes et 45 secondesthrough the various days of the month, which is really cool. Here's we can actually see like the the total number of calories that I've tracked
2:28:522 heures, 28 minutes et 52 secondesin the calendar section. Um I like the little popup that occurs when you click on a day that has some some logs, but I
2:28:592 heures, 28 minutes et 59 secondesalso like you to show progress um of the day. So right now we have total number of calories, protein, carbs, and fat.
2:29:062 heures, 29 minutes et 6 secondesBut I want to show how much of that we ended up logging of the goal for that day. Okay, I'm just going to feed all of that back in. And then we'll go to
2:29:142 heures, 29 minutes et 14 secondessettings. And now this looks pretty good. We actually have a little daily goal section with the notifications available on iOS, Android only. That's cool. So, if I click this, you can see
2:29:212 heures, 29 minutes et 21 secondesreminders at 8, 12:30, and 6:30. That's really cool. We should also be able to adjust our reminder times so that uh you know, if somebody eats breakfast a
2:29:302 heures, 29 minutes et 30 secondeslittle late or something like that, they can also uh customize their push notifications.
2:29:352 heures, 29 minutes et 35 secondesSo, I like that. That's pretty sweet. I wonder if we could also just like create more reminders in general because uh some people have like snacks and some people have other things. Alternatively,
2:29:432 heures, 29 minutes et 43 secondeswe could just have like an end of day log sort of deal. U you know, offering people some flexibility in an app is important. You don't want to offer people too much flexibility. I also
2:29:512 heures, 29 minutes et 51 secondesdon't really like the design on today's log, but that's not a big deal cuz I'm going to run you guys through a big like design uh flow later. Okay, cool. So, it
2:29:582 heures, 29 minutes et 58 secondeslooks like we have a bunch of uh changes here. So, I'm just going to click on this. And I'm not seeing any entry here.
2:30:042 heures, 30 minutes et 4 secondesSo, I'm what I'm actually going to do is I'm just going to delete this. And I'm noticing that when I click the delete button, it doesn't actually delete. when I click the delete button on an entry,
2:30:112 heures, 30 minutes et 11 secondesuh, when I've full screened it, it doesn't actually delete. So, fix that.
2:30:162 heures, 30 minutes et 16 secondesAnd, you know, this occurs for a variety of reasons. Um, but, you know, I'm unsure of whether or not that's just like a simple UX thing. Yeah, it looks like it's just a UX thing. Um, for
2:30:242 heures, 30 minutes et 24 secondeswhatever reason, when I clicked up in the top right hand corner, it didn't show up, but when I clicked down there, it's fine. So, now I'm just going to go and I'm going to add some more rice and chicken. And let's uh do a a meal
2:30:322 heures, 30 minutes et 32 secondesanalysis. And just because it's refreshing, it's sending it to the API a couple more times. So, I'm just going to log it. Okay. Now that I've logged in, I can actually click and I can actually
2:30:392 heures, 30 minutes et 39 secondessee the image. So that was either a temporary problem or a problem because we kind of refactored the app, but this is what I wanted, right? I actually wanted to be able to see this. And actually, I think they compress the
2:30:482 heures, 30 minutes et 48 secondesimage automatically, which is quite nice. Notice that. So that's lovely.
2:30:522 heures, 30 minutes et 52 secondesOkay, great. And then yeah, over here they're currently implementing the um calorie proportion feature. So it's going to show proportionally. And then we have the ability now to customize the
2:31:012 heures, 31 minutes et 1 secondemeal reminder time, which is kind of cool. So breakfast, lunch, and dinner.
2:31:042 heures, 31 minutes et 4 secondesThat's very, very sweet. And uh yeah, you know, the goal, as mentioned, is to be opinionated, not uh so opinionated that uh you know, the user feels really
2:31:132 heures, 31 minutes et 13 secondeslocked in, but pretty opinionated. So you do some of the thinking for them.
2:31:162 heures, 31 minutes et 16 secondesAnd this looks pretty solid. So you can actually see like the historical tracked logs because there's no entries for the day, we kind of failed, right? But this day where we actually had an entry that
2:31:242 heures, 31 minutes et 24 secondesworked. Cool. So I like this. I think that more or less what we've done here is great. There's just one more feature that I want to add for the core loop.
2:31:302 heures, 31 minutes et 30 secondesAnd that's where I could see some some situations where somebody might want to go back to maybe yesterday and then log.
2:31:372 heures, 31 minutes et 37 secondesAnd I don't currently think we can cuz I don't think we can change the day.
2:31:402 heures, 31 minutes et 40 secondesThere's one more feature I'd like to add. I want people to be able to go back in time and then add logged entries to specific days. I think that's a pretty
2:31:482 heures, 31 minutes et 48 secondescommon need. Say I forgot to add stuff today and uh I sorry I forgot to add stuff yesterday and you know it's the morning. I want to be able to go back and add everything for the previous day.
2:31:572 heures, 31 minutes et 57 secondesSo add some way to change the day that we're currently on on the today page so that we can kind of like go back and forth and rather than call it today,
2:32:052 heures, 32 minutes et 5 secondescall it like dashboard or something like that so that the user has the ability to kind of modify the date. Um they'll be able to do that and then they should
2:32:122 heures, 32 minutes et 12 secondesalso be able to actually add entries on the progress page when I click in a specific day because that might be a little bit faster uh for some use cases.
2:32:192 heures, 32 minutes et 19 secondesFinally, provide the ability to delete uh different reminders and then customize what they're called in addition to their time. So, for instance, if somebody only eats two meals a day, maybe only breakfast and
2:32:272 heures, 32 minutes et 27 secondeslunch, he should be able to delete the dinner entry. Cool. Looking pretty good.
2:32:312 heures, 32 minutes et 31 secondesIf I go back to Chrome here, you can see that we now have the additional functionality of being able to change the day. And at any point in time, I can click this button and h and jump back to
2:32:392 heures, 32 minutes et 39 secondestoday, which is really cool. So, you know, I could go back to the sixth. I could log the exact same meal here. And you'll see that like the calorie consistency is very similar. 620, 38,
2:32:472 heures, 32 minutes et 47 secondes52, 26. I think fat might have been 28 before, but this is actually hyper hyper consistent. So, now I can add that to my log. And you'll see I now have that same
2:32:542 heures, 32 minutes et 54 secondesmeal, that roasted chicken uh on the 6th as well as today. And if I go to progress, I now have two logged entries, one on the 6th and one today, which is
2:33:022 heures, 33 minutes et 2 secondesquite nice. And I can also edit this at any point in time. Maybe I want this to be 650 calories. I can save that. And now we actually have like some mild caloric differences. Although
2:33:102 heures, 33 minutes et 10 secondesmathematically this doesn't really make sense cuz you can't just add calories out of nowhere. Realistically, the protein, carbs, and fat change, too.
2:33:162 heures, 33 minutes et 16 secondesStill, I want to give people the granularity and the ability to do that.
2:33:182 heures, 33 minutes et 18 secondesNow, we have our reminder set up so I can minus out the thing. And maybe I just want breakfast and lunch and I want lunch to occur at 2:30. Uh, that looks pretty good to me. No major issues. And
2:33:262 heures, 33 minutes et 26 secondeslet's just double check that we can actually rerun the onboarding to update my goals. Looks like we can. Just want to maintain the weight. This looks like it fixed itself and I can actually see
2:33:352 heures, 33 minutes et 35 secondesmy plan. Let's go. And when I do that, when I rerun the onboarding, what's really important is it doesn't just re like jig the whole app, right? I still have the logged entries from before. Um,
2:33:432 heures, 33 minutes et 43 secondesit's just these logged entries have been updated with the new calorie totals. All in all, this is looking pretty good and I'm liking where this is going. I'm still obviously going to need to run
2:33:512 heures, 33 minutes et 51 secondesthrough the testing of, you know, like the ability to take photos and stuff like that on my phone. What I want to do now is I want to significantly upgrade the design cuz to me, this design is actually really stuffy and, you know,
2:33:592 heures, 33 minutes et 59 secondesthe dark mode apps are are kind of annoying nowadays. I I don't know. I I like the Cal AI uh vibe. Now, what I'm going to do is, you know, I don't just
2:34:072 heures, 34 minutes et 7 secondeswant to copy this mercilessly, but I really do like the way the app is laid out. I think what I'll do is I'll just start with this as like my my little feature. Um, and then I'll make
2:34:152 heures, 34 minutes et 15 secondesadjustments to the design after this so that you know the end result doesn't end up just being a carbon clone or carbon copy. What I'll say is, I love the
2:34:242 heures, 34 minutes et 24 secondesdesign of the app that I just screenshotted over to you. I want you to start by emulating that design. Right now, the design is pretty weak. I'd like you to upgrade it so it more or less
Chapitre 29 : Finalizing the App Design
2:34:322 heures, 34 minutes et 32 secondeslooks exactly like this app does, just without some minor logo things rather than call it Cal AI, call it Cal Tracker. After we're done uh modifying
2:34:402 heures, 34 minutes et 40 secondesthe design and at least like building in like a reasonable uh library of components, etc., uh I'll modify the design so that the end result looks a little different.
2:34:492 heures, 34 minutes et 49 secondesNow, I'm just going to have that go. And what's really cool is the design at the end of the day ends up being a very, you know, once you have the core functionality, all we're really doing is we're just changing the styles. We're
2:34:572 heures, 34 minutes et 57 secondeschanging the fonts a little bit. We're changing the colors in the background and stuff like that. So, this part's much much easier. And uh personally, I think this Claude is significantly
2:35:052 heures, 35 minutes et 5 secondesbetter at doing this. You can also use like built-in uh libraries and tools like claw design in order to do that for you. Although I think in our case it's much easier for me just to proceed uh
2:35:142 heures, 35 minutes et 14 secondesmanually just prompting it and going back and forth. What I think I'm probably going to want to do is this is sort of like a black and white color scheme. I think I'm going to want to go
2:35:222 heures, 35 minutes et 22 secondesuh not black but like kind of like dark blue gray instead. So give it sort of like a cool gray feature. Um, I think I'm also going to modify the font. So,
2:35:302 heures, 35 minutes et 30 secondeswe have some Sarah fonts because while I like this sans Sarah font, I think a Sarah font would be really cool. And then I like how we have these emojis,
2:35:392 heures, 35 minutes et 39 secondesbut I'm noticing these emojis are sort of all over the place color-wise. I think I'm just going to do some sort of like monochrome, dark gray, dark blue emoji. I think that's going to look
2:35:462 heures, 35 minutes et 46 secondesreally clean. Um, this is cool. I mean, obviously, it's not identifying the specific elements in the in the photo like through our app. Um, but you know,
2:35:542 heures, 35 minutes et 54 secondeswe can we can scan the food. We can take a photo of the food and then we can upload it and that's clean. I like this sort of modal or layout. You know, the thing about app design is it everything
2:36:022 heures, 36 minutes et 2 secondestends to be sort of rounded corners and that's just because usually the phones that you're on have rounded corners and you know, in the case of an iPhone anyway, um everything is sort of beveled
2:36:102 heures, 36 minutes et 10 secondesand and has that clean look. But you can also experiment with a rounded corner nature of it and the color scheme. So, I think that's probably what I'm going to do. I think I'm going to make the
2:36:172 heures, 36 minutes et 17 secondescorners significantly less round because I want to give like a higher lux feel.
2:36:212 heures, 36 minutes et 21 secondesAnd then I'm also just going to make all of the the icons monochrome as well, which should look a lot easier, a lot clearer. And then I see we have a couple
2:36:292 heures, 36 minutes et 29 secondesof additional buttons here which we didn't have before. But um you know with the with the graphs and stuff like that, I think I'm just going to stick to like
2:36:362 heures, 36 minutes et 36 secondesthat nice cool cool blue um color palette. And there's like um a feature here.
2:36:442 heures, 36 minutes et 44 secondesWell, not a feature, but uh a little tool here called the the UI colors app generate which you can use to very quickly scaffold out some reasonable
2:36:512 heures, 36 minutes et 51 secondescolors. So for instance, this is like a a color skin or scale for what looks to be like a lily sort of color. What you can also do is at any point in time you
2:37:002 heures et 37 minutescan just press spacebar and then you can customize it and change it. And so what I think I'm going to do is I'm going to go until this is like kind of like dark, you know, blueish.
2:37:092 heures, 37 minutes et 9 secondesMaybe I'm going to move this just a tad so it's kind of on like the I don't want to do like indigo, but maybe something like this. That looks pretty cool to me.
2:37:182 heures, 37 minutes et 18 secondesAnd you know, you can actually go through this whole website, let's say, and you can see how these colors work.
2:37:222 heures, 37 minutes et 22 secondesAlthough, I guess you need to upgrade to Pro for that. Uh, and you know, this isn't a pitch for this particular service or website. I think I'll just stick with cards. But once I have this
2:37:302 heures, 37 minutes et 30 secondesnow, what I can do is I can actually just like copy all of these colors.
2:37:352 heures, 37 minutes et 35 secondesThis thing stops opening every two seconds. I can actually copy all these colors. Okay. And then I can paste that in and I can say, great,
2:37:432 heures, 37 minutes et 43 secondesupdate color scheme. So, it looks like this. Also make sure all icons, emojis
2:37:502 heures, 37 minutes et 50 secondesare monochrome, eg they're of the same color as that palette. Important we
2:37:562 heures, 37 minutes et 56 secondesstick to that palette from now on. Also apply high-end lux style serif fonts
2:38:042 heures, 38 minutes et 4 secondesrather than sans serif. Let's do serif fonts for the um you know display display/headings rather than sans serif
2:38:132 heures, 38 minutes et 13 secondesand focus on reducing the corner rounding just a tad to make it
2:38:222 heures, 38 minutes et 22 secondesfeel higher end. Okay. Now for anybody that doesn't know a saraf font is just a font that um is sort of like a little old timey like this is a sans saraf
2:38:312 heures, 38 minutes et 31 secondesfont. sort of a new font, but a serif font, if I just exit out of this, is
2:38:382 heures, 38 minutes et 38 secondesjust a little twang essentially. You see how this s um sans serif would have just been, you know, something that look kind
2:38:462 heures, 38 minutes et 46 secondesof like this. Well, a sand serif is well, a serif is one that sort of has like these little things at the ends.
2:38:522 heures, 38 minutes et 52 secondesAnd so, you know, design has sort of gone back and forth between serif and sans serif a bunch of times, but I like the idea of sort of a a sans or sorry, a
2:39:012 heures, 39 minutes et 1 secondeserif font for um headings just because I think it makes the app look kind of unique. Okay, so anyway, they've opened this up now and this is sort of our cal tracker. And you can see here the design
2:39:092 heures, 39 minutes et 9 secondesis still lacking. It's not exactly what we wanted, but we're going to continue modifying this until it gets higher and higher end. Um, but I am liking what's going on here. We sort of have these little charts that are popping up. Okay.
Chapitre 30 : Testing and Debugging the App
2:39:192 heures, 39 minutes et 19 secondesSo, it's looking a lot cleaner and uh you can actually see the little calendar view on the main window now, not just on uh you know the progress page. Now,
2:39:272 heures, 39 minutes et 27 secondeswe're going to modify all of the colors and stuff so that it looks a lot cleaner. And what I like about this is notice how we can actually see um the
2:39:352 heures, 39 minutes et 35 secondesentire header here and it only gets truncated when we mouse over it here.
2:39:412 heures, 39 minutes et 41 secondesWhat I'd like is I'd actually like this to spill over. So, I I like that we can actually see roasted chicken thigh with dirty rice. I think I'm probably going to modify the prompt a little bit as
2:39:502 heures, 39 minutes et 50 secondeswell so that like the outputed titles are shorter. Modify the prompt of the AI so that the outputed food titles are shorter and then fix the truncation so
2:39:572 heures, 39 minutes et 57 secondesthat instead it wraps. Make sure the design looks really nice on the wrap too so that uh you know if we have a longer title it still fits within the bounds of the card and nothing is cut off or looks weird.
2:40:092 heures, 40 minutes et 9 secondesOkay, cool. Yeah, I'm really liking that now. And then if I go to profile, how does that look? It looks like we've lost some of the, you know, outlines or headings or cards or something like that
2:40:162 heures, 40 minutes et 16 secondesbecause as we see here, these aren't really nicely aligned anymore. So, I think it's probably just changed the colors a little bit without fully having screenshotted all the pages on the app
2:40:252 heures, 40 minutes et 25 secondesand sort of like gone through that that feature in its sense. So, I'm just going to make a couple of additional minor um style modifications and so on and so forth, and then I'll circle back when
2:40:332 heures, 40 minutes et 33 secondesit's all ready. Well, it's definitely looking different. Um maybe these Sarah fonts aren't actually a good idea. Maybe it's just the specific font that I'm using cuz that looks kind of lame to me.
2:40:422 heures, 40 minutes et 42 secondesI don't know. Oh, it doesn't look as high-end as I was initially planning.
2:40:442 heures, 40 minutes et 44 secondesAnd that's okay. We can change the design anytime we want. But notice how now the background has this kind of cool gray to it. Um, the home is still kind of compressed, I would say, up top. I don't really like how compressed it is.
2:40:532 heures, 40 minutes et 53 secondesI'm also noticing there's just different types of design. Do you notice how here there's no outline, but then over here there's an outline. What we need to do is we just need to fully um I want to
2:41:012 heures, 41 minutes et 1 secondesay harmonize the design. I'm noticing that there are slightly different types of designs on each different page. For instance, the homepage has an outline
2:41:092 heures, 41 minutes et 9 secondesaround each card, whereas the profile page doesn't have an outline around each card. I want you to remove outlines around all cards and favor clean, minimalistic design over um busy design.
2:41:182 heures, 41 minutes et 18 secondesAlso, noticing that the homepage is very compressed and kind of stacked up top.
2:41:222 heures, 41 minutes et 22 secondesI'd like you to distribute each of the elements a little bit more organically so that it doesn't look super stacked.
2:41:272 heures, 41 minutes et 27 secondesAnd then instead of using a Sarah font like I talked about before, just pick a really good common um sans saraf font, one that is typically associated with
2:41:352 heures, 41 minutes et 35 secondeshigh-end clean designs. Everything else looks pretty clean as it stands. Um I also like the monochrome emojis and
2:41:422 heures, 41 minutes et 42 secondesicons. This is just probably the major lowhanging fruit here. Now on the entry page, I'm noticing that some of the text
2:41:502 heures, 41 minutes et 50 secondesis overwritten by the div. So, just make sure that when you do a test, you actually run through every single page,
2:41:572 heures, 41 minutes et 57 secondestake a screenshot of it, and um itemize anything that may be sub-optimal or sub uh you know, below par before modifying
2:42:042 heures, 42 minutes et 4 secondesit on your own to make sure that it's as clean as possible. Also, I don't like the green button that uh is next to the meal reminders toggle. That looks kind
2:42:132 heures, 42 minutes et 13 secondesof weird right now. So, rather than making it green, make it align with the rest of the color palette. And in general, just go through one final time and ensure everything aligns with the color palette I asked for.
2:42:232 heures, 42 minutes et 23 secondesOkay, we'll go back here and continuously loop back until we get a really nice design. Looks significantly better. I want you now to go through the
2:42:312 heures, 42 minutes et 31 secondesdesign page by page and then itemize and enumerate a list of all possible improvements you can make to make it higherend, sleeker, and more lux. Self
2:42:392 heures, 42 minutes et 39 secondesloop as many times as you need to implement all of that design functionality cuz it's still looking just a little tight and rough around the
2:42:462 heures, 42 minutes et 46 secondesedges. Also add way cleaner icons for the home, the progress, and the profile tabs down at the bottom. Those look pretty low-end right now. Also add some
2:42:532 heures, 42 minutes et 53 secondesdaily weight tracker chart that you could see over time like Cali.
2:42:582 heures, 42 minutes et 58 secondesContinuing to modify the design, but we're getting pretty close. This is now looking really clean. I like the profile page. Notice how um these divs are now
2:43:052 heures, 43 minutes et 5 secondesreally nicely laid out. Color scheme makes perfect sense. This is like a dark blue instead of a pure black. We still have a weird green toggle here, but uh
2:43:132 heures, 43 minutes et 13 secondesI'll fix that up. Progress is also looking really clean. You can see how now all of the colors sort of reflect this monochrome look. And this page here, despite that being kind of a
2:43:202 heures, 43 minutes et 20 secondescompressed image, um, just looks really nice. We don't have any like weird text that's laid out and so on and so forth.
2:43:252 heures, 43 minutes et 25 secondesWe can also remove entries really easily just by giving these buttons quick clicks. And the actual like UX when I click this button is, uh, is nice as well. So you can see we now can modify
2:43:342 heures, 43 minutes et 34 secondesthe protein, carbs, and fats, and the calories are sort of up here instead. We have the ability to fix our results by basically just rerunning, saying, "Hey, something is wrong here." Once we're
2:43:422 heures, 43 minutes et 42 secondesdone, we get a nice, beautiful little animation. If I go back to the homepage here, I'd say this is probably the biggest issue because it's also the first place that users will see. This is
2:43:502 heures, 43 minutes et 50 secondeslooking a little crammed. And then I don't like how small these are right now. But I do like how we've now modified the colors and we have cute little icons. Um, so all of this stuff
2:43:572 heures, 43 minutes et 57 secondesis just uh, you know, a couple of prompts away as you guys could see. Not that big of a deal. Um, this little plus button here can add a meal. I think realistically we should also have the
2:44:052 heures, 44 minutes et 5 secondesability to um, track weight. So I actually asked it, hey, you know, can you add a weight tracking feature? So, what I think we'll do after that is probably add like a weight graph right
2:44:142 heures, 44 minutes et 14 secondesover here that is some sort of like line chart so that you could see your weight go up or go down over time. Um, because we're modifying it right now on like the design level, the database and stuff
2:44:222 heures, 44 minutes et 22 secondeslike that is really easy to to change cuz it's all local. If we were to try and make all these modifications after we had like an actual live database, every time we do this, we have to push
2:44:302 heures, 44 minutes et 30 secondesto like a new schema inside of Superbase, which just take a lot of time, energy, and then also consistently deprecate any old data. So, we'd also
2:44:382 heures, 44 minutes et 38 secondeshave to add like a big chunk to our testing loop. So, that's kind of annoying. Not Not a fan. I'm seeing that this still isn't really getting fixed, though. Notice how this just modified it
2:44:462 heures, 44 minutes et 46 secondesand kind of push it into the middle. I feel like it's probably fundamentally misunderstanding something. So, we should do some sort of screenshot testing loop here. I think what I'm
2:44:542 heures, 44 minutes et 54 secondesgoing to do is I'm actually going to have it open it up in Chrome DevTools instead and then just test it all end to end. That way, it can go through this cycle autonomously and then fix the um
2:45:032 heures, 45 minutes et 3 secondesyou know, the fact that these these cards aren't fully laid out. But right before that, I'm just going to take a screenshot and I'll say make the
2:45:112 heures, 45 minutes et 11 secondesprotein eaten, carbs eaten, and fat eaten section,
2:45:192 heures, 45 minutes et 19 secondeslet's say circles much larger so that we don't have weird spacing. Right now, it's not left or right aligned. should
2:45:272 heures, 45 minutes et 27 secondesbe proportional to the page so that the padding etc is
2:45:342 heures, 45 minutes et 34 secondesfixed left and right side. Cool. And uh you know at this point I'm really just dumping in changes as time goes on. It's
2:45:412 heures, 45 minutes et 41 secondesuh a very simple and straightforward for me. Uh and I do a new change usually while it's still implementing the old change because those changes tend to be pretty separated. So now for instance I
2:45:492 heures, 45 minutes et 49 secondessee this plus button. It doesn't have ability to log weight. I'll say add weight log feature to the plus button.
2:45:562 heures, 45 minutes et 56 secondesso that when somebody clicks the plus button that's in there. This is looking better for sure, but we're still a little bit off. I don't like that. So,
2:46:032 heures, 46 minutes et 3 secondeswhat I'm going to do is I'll say great, now open up in your own Chrome window and screenshot through the app.
2:46:122 heures, 46 minutes et 12 secondesEnumerate all of the minor inongruencies in design. So, like spacing, margins, uh
2:46:202 heures, 46 minutes et 20 secondesalignment on left and right sides, etc., and then fix each in turn. Eg the
2:46:272 heures, 46 minutes et 27 secondescalories eaten and then macro nutrients section is still out of alignment. Want
2:46:332 heures, 46 minutes et 33 secondesthis fixed on a I don't know, you know, mobile uh respon, you know, in a mobile responsive way.
2:46:432 heures, 46 minutes et 43 secondesCool. From here on out, we can log the food, we can log the weight. That looks nice. What happens when we Okay, and you can see we're actually going through this whole process, which is very nice.
2:46:502 heures, 46 minutes et 50 secondesYou can see it's now modifying this actually on its own. So I'm just going to duplicate this and I'm going to have another window open over here. Okay, which is kind of my own. And uh I'm just
2:46:582 heures, 46 minutes et 58 secondesgoing to, you know, do what I'm doing on on the lefth hand side here while it does what it's doing on the right hand side. So I don't know, maybe I want to gain weight. Have the ability to enter
2:47:062 heures, 47 minutes et 6 secondesall this information in. Looks pretty clean. See my plan. And then over here we have, you know, the the three sort of
2:47:132 heures, 47 minutes et 13 secondescalorie and protein, carbs, and fat uh recommendations. That looks pretty cool.
2:47:182 heures, 47 minutes et 18 secondesAnd then what happens when I log weight now? Looks like the weight log is an issue. So when I click weight log, we can see this clearly extends a little
2:47:262 heures, 47 minutes et 26 secondesbit too much over to the right hand side. And I imagine that's because this width is just fixed, which is um an issue. So I'm going go back over here and I'll say some issue with the weight
2:47:342 heures, 47 minutes et 34 secondeslog feature right now. Um when I click the button, the field spills all the way over to the right hand side. It doesn't really look responsive or dynamic.
2:47:432 heures, 47 minutes et 43 secondesOkay, cool. And uh it's just actually going through and you know testing and so on and so forth this page right now which is kind of clean. But anyway, let me actually test that functionality.
2:47:522 heures, 47 minutes et 52 secondesWe'll say 175 and I'll save. And then we need to log at least two weigh-ins to see my trend. So could I log 176 now?
2:48:022 heures, 48 minutes et 2 secondesAnd then we could kind of see this change over time.
2:48:062 heures, 48 minutes et 6 secondesNo, it doesn't look like I think we're going to need to actually log two in two separate days. So obviously we're going to need the ability to log the weight on a different day as well. I think
2:48:132 heures, 48 minutes et 13 secondesprobably what we're going to want to do is we're going to want to add the recently uploaded or recently logged and then have this be both a combination of um food and weight. For the recently
2:48:222 heures, 48 minutes et 22 secondesuploaded section on today, uh make it so that it's recently logged instead of recently uploaded and that we have the ability to log or rather it has the
2:48:312 heures, 48 minutes et 31 secondesability to list both meals and also weight. The idea is right now we we should be able to log directly from the
2:48:382 heures, 48 minutes et 38 secondeshomepage. Instead, the ability to log weight is buried in the progress page and stuff like that. There's really no need to make this overly complex. Just
2:48:452 heures, 48 minutes et 45 secondeshave the ability to um you know, log weight with the plus button and then have all of that appear under recently uploaded. Also, we should be able to change the date that we're logging
2:48:542 heures, 48 minutes et 54 secondesweights because we again may want to historically log our weight a couple days ago or something like that. And while we did that, you can see it actually fixed these little macro
2:49:012 heures, 49 minutes et 1 secondecircles and this is now looking a lot cleaner. I'd go as far as saying like this is now, you know, about as good as you can realistically get. I think there's some minor issues like when you
2:49:092 heures, 49 minutes et 9 secondeskind of scale back here and this text is still kind of um you know very very what's the term the tracking is very tight that just means like there there's
2:49:172 heures, 49 minutes et 17 secondesvery little space between each um element. I'm also noticing that this uh card doesn't fully you know spill over which is unfortunate just given the fact
2:49:242 heures, 49 minutes et 24 secondesthis is now on three lines or so. I think ideally what we'd want is we'd want the calories and then the macros to be right next to it in a case like this because then we'd actually be able to
2:49:322 heures, 49 minutes et 32 secondesmake the card smaller, but at the same time, you know, we it is clearly trying to respect the fact that I said, "Hey, I want you to like spill over the line as
2:49:412 heures, 49 minutes et 41 secondesopposed to go all the way out." So, I think what we'll probably have to do here is we'll probably need to on really tiny displays just like really compress
2:49:482 heures, 49 minutes et 48 secondesthe hell out of everything. on really tiny displays. Uh we should find a way to showcase all of the information aka
2:49:572 heures, 49 minutes et 57 secondescalories, uh protein, carbs, and fat under the recently log section such that the car doesn't get super tall. Right
2:50:062 heures, 50 minutes et 6 secondesnow, we're spilling over onto four lines like the following, which is very suboptimal and uh inefficient. Instead,
2:50:132 heures, 50 minutes et 13 secondesyou know, if we're on a very small display, I want you to come up with a way to showcase all that information on two lines max. And that includes both
2:50:202 heures, 50 minutes et 20 secondesthe title and also the um you know actual like calorie info. Okay. And I'm realizing here I just did that by accident. So now I'm filling that in.
2:50:282 heures, 50 minutes et 28 secondesNotice how long this is for instance.
2:50:292 heures, 50 minutes et 29 secondesNow how ugly that card is. If I click this button, can I log the weight? Okay.
2:50:332 heures, 50 minutes et 33 secondesAnd I see it actually goes today, May 6th. So uh one more feature I'm going to do is if I'm on the uh let's say May 6th
2:50:422 heures, 50 minutes et 42 secondesday and I click the plus button, the weight log should immediately jump to the May 6th day. It shouldn't default to today. Uh, it should basically default
2:50:502 heures, 50 minutes et 50 secondesto whatever day the homepage is currently on. Okay, that looks pretty clean as well. And then over here, we we do have that truncation. And I guess that's sort of the way that it came up
2:50:582 heures, 50 minutes et 58 secondeswith things. I'm wondering if there's a way just to get like the calories down below as well. I don't want any
2:51:052 heures, 51 minutes et 5 secondestruncation. Um, maybe you can truncate a little bit longer. Sorry.
2:51:112 heures, 51 minutes et 11 secondesOkay. Let me make sure I 100% know what I'm about to say before I try and direct this AI because at the end of the day, I am spending tokens and whatnot. So, what exactly do I want? Well, I want this
2:51:202 heures, 51 minutes et 20 secondestitle, okay, can be a little bit longer, but I basically want this calorie line to be down here. And then I want all of these compressed. You can truncate the
2:51:292 heures, 51 minutes et 29 secondestext, but do so significantly wider. And then combine the calorie and then macronutrient lines using a smart
2:51:372 heures, 51 minutes et 37 secondescombination of abre abbreviations, compressed text, smaller text, etc. do whatever you need to in order to ensure
2:51:452 heures, 51 minutes et 45 secondesthat you could see maybe double the current number of characters on that top line. Um, and then I'm noticing now that
2:51:532 heures, 51 minutes et 53 secondeswe have the ability to log weight in addition to uh log food. The little profile picks and images are slightly
2:52:012 heures, 52 minutes et 1 secondeoff. They're not perfectly aligned. So, I think the padding on those cards or the spacing is uh is different. I'd like
2:52:072 heures, 52 minutes et 7 secondesyou to realign the logged calorie entries so that they perfectly match the
2:52:142 heures, 52 minutes et 14 secondessize, width, and then layout of the weight log entries. Cool. We'll stick that in as well. Yeah, the rest of the stuff looks pretty clean. Okay, now this
2:52:222 heures, 52 minutes et 22 secondesis correctly identifying sort of May 6th. If I go back to progress, you see now we actually have a chart, which is nice. So, why don't I go back here to
2:52:302 heures, 52 minutes et 30 secondesMay 4th, log the weight, and just pretend that I was significantly skinnier. Let's go back to progress. And now you can actually see this is this is
2:52:372 heures, 52 minutes et 37 secondesrising over time which is quite nice. We can zoom out to 3 month 6 month all. Uh presumably we can't see that right now because we only do have three weight entries. Um I think the last thing we
2:52:462 heures, 52 minutes et 46 secondesneed is we just need some sort of x-axis. We need some sort of x-axis to the graph for weight log right now because we don't currently have that.
2:52:542 heures, 52 minutes et 54 secondesOh, and uh one more thing under profile.
2:52:572 heures, 52 minutes et 57 secondesThe meal reminders button is still green. The meal reminders button under profile the little toggle is still green. just make it a shade of blue
2:53:052 heures, 53 minutes et 5 secondessimilar to the rest of our color palette. Cool. This looks way cleaner as you can see over here. And if we go under progress, you can see we actually now have the dates logged. Although this
2:53:132 heures, 53 minutes et 13 secondesis with Sarif font, so I'm going to make one minor change. Um the x-axis is with serif fonts. I want sans serif. Okay.
2:53:222 heures, 53 minutes et 22 secondesAnd now we have the finished design of the three pages, the home, the progress, and the profile. As you guys can see, this is now populating. Um, you know, as
2:53:312 heures, 53 minutes et 31 secondesI go through each of these, we have everything nicely aligned. We unfortunately were unable to fix the truncation. Like to me, this is still
2:53:392 heures, 53 minutes et 39 secondesjust a little bit too close. But, um, I looked at the aspect ratio and then also the total number of pixels. And most phones will be somewhere like this
2:53:472 heures, 53 minutes et 47 secondesbetween the two. So, we should be able to see the protein, the calories, and the fat down there. Uh, if you go down to the progress page, we obviously now have the the weight progress, and everything's really clean on that end.
2:53:562 heures, 53 minutes et 56 secondesAnd then we also can, you know, exit out or jump directly into different logged entries and stuff like that. Then we have a much nicer kind of looking flow,
2:54:042 heures, 54 minutes et 4 secondesI would say, alongside the breakfast and lunch reminders. So, this looks pretty good. I mean, I'm probably not going to want to include the anthropic API key in the final product. If you think about
2:54:122 heures, 54 minutes et 12 secondesit, like it's kind of like my job is like the app dev. Your requests are passed through my anthropic API key. I pay for the usage and then I just charge you a monthly subscription with like
2:54:202 heures, 54 minutes et 20 secondesenough margin to make uh make me some some delta. But uh you know I'll just leave that in for now just to kind of keep the app customizable and uh see
2:54:272 heures, 54 minutes et 27 secondeswhere we go from there. Uh oh and then finally that plus button I think is really clean. So now that we've tested all the stuff locally and I've verified the design as I like we can actually
2:54:352 heures, 54 minutes et 35 secondeslike you know push through and and do that next step which if we go back over here to this big excaladraw
2:54:422 heures, 54 minutes et 42 secondesokay is all the way over here now which means we just tested it with our computer. Now we have to test it with
2:54:512 heures, 54 minutes et 51 secondesthe phone mirror. And then finally, I'm going to do a phone reel. Uh, this is obviously pretty intensive and I don't want you guys to sit around just watching me do a bunch of testing and minor edits. I think the design part was
2:54:592 heures, 54 minutes et 59 secondesinstructive, but from here on, I'm just going to test it on the iPhone mirroring app on my end. Then I'll circle back with any adjustments or problems that that I had. Okay, I just wanted to show
2:55:062 heures, 55 minutes et 6 secondesyou guys this is it is so clean. Uh, it's basically exactly what I wanted.
2:55:102 heures, 55 minutes et 10 secondesAnd um, I just tested this with my phone and the the the haptic feedback and all like the little interactions were really really nice. But um, yeah, I mean the
2:55:182 heures, 55 minutes et 18 secondeslayout on this is just absolutely gorgeous. So, I think this is probably one of the nicer apps that I've put together in a pretty short period of time. Um, you know, I am noticing some
2:55:262 heures, 55 minutes et 26 secondesminor asynchronies like for instance, uh, sorry, inongruencies where the lefth hand most aligned part of the height and the weight and stuff like that are not
2:55:342 heures, 55 minutes et 34 secondesaligned with the text underneath. These are minor changes that I'll do, uh, that I just couldn't see until I was actually on my phone. But, um, yeah, I mean, like, this is really clean. It has more
2:55:422 heures, 55 minutes et 42 secondesor less the exact functionality that I want. What's really cool is, um, unfortunately, I don't know if I could show you guys the camera feature, but the camera feature is is really cool.
2:55:492 heures, 55 minutes et 49 secondeslike the UX and stuff like that is because I'm using the iPhone mirroring app. Um I think this is going to bug out. Yeah. So I'm unfortunately not able to show you guys. But um very cool and
2:55:582 heures, 55 minutes et 58 secondesuh you know you can take a photo of your food and when you do so it it it has the exact same UX as what we saw with uh the Chrome version of uploading a photo. Uh
Chapitre 31 : Integrating the Database
2:56:062 heures, 56 minutes et 6 secondesthe stuff like this and this minor UX change is just so awesome to see as somebody that you know put something together like this in 15 or 20 minutes.
2:56:132 heures, 56 minutes et 13 secondesCool. So now that I'm done with all of this, we sort of have to do that next step which is add a database. And then after we're done the database, we'll have to run another test, then a security audit, and then finally another
2:56:222 heures, 56 minutes et 22 secondestest before deploying. Um the database is going to be pretty simple. Same idea as what we had before. We're just going to set up O on Superbase. And then I'm going to set up the whole DB stuff on my
2:56:302 heures, 56 minutes et 30 secondesend. Give it the keys, and then it'll run away. Uh and you know, implement everything. Now, first before I go any further, I will say the number of tokens
2:56:382 heures, 56 minutes et 38 secondesthat I'm using the bottom rightand corner is getting pretty long. And it depends on what model you're using, but um typically after like 200,000 or so tokens, the performance of the model
2:56:462 heures, 56 minutes et 46 secondestends to decrease significantly and your ability to make minor kind of granular changes uh goes down. And so generally my rule of thumb is like if I'm at like
2:56:542 heures, 56 minutes et 54 secondesthe 250 to maybe like 300,000 mark, I usually perform what's called a compaction before going any further. Uh and that compaction is pretty easy. You
2:57:012 heures, 57 minutes et 1 secondejust go slash compact. What occurs is it gets all of the history in your whole conversation and then it just like compresses it. You know, instead of
2:57:092 heures, 57 minutes et 9 secondesusing words like fixed, the app now explicitly requests camera or photo library permissions, it might go fixed.
2:57:172 heures, 57 minutes et 17 secondesApp asks for camera/photo perms before launching picker. And notice how like this still has all the
2:57:252 heures, 57 minutes et 25 secondessame information as this. It's just I don't know 50% as long, maybe 60% as long. So we get to save that 40% and basically bankroll that and that
2:57:342 heures, 57 minutes et 34 secondesimproves the performance of um you know claw on the next iteration which is quite handy. The downside of this is it takes a fair amount of time. So, while it's doing that, I'm going to go and set
2:57:412 heures, 57 minutes et 41 secondesup Superbase. Same idea as what we were doing before. I'm just going to go start a project and then um you know, we have a tracker app over here. I should be able to start a new one, I believe.
2:57:502 heures, 57 minutes et 50 secondesYeah, looks like I can for project name.
2:57:522 heures, 57 minutes et 52 secondesI'm going to call this Cal Tracker. Then I'm just going to use whatever the default password is here. And I'm just going to copy that over. It's use password copy. And then remember to
2:58:012 heures, 58 minutes et 1 secondeenable automatic RLS anytime you're doing this because um that's just one of the lowest hanging fruit security upgrades. This wasn't actually here before. You had to do a bunch of backend
2:58:092 heures, 58 minutes et 9 secondescoding stuff in order to get it up and running. But so many uh like vibe coded apps had gotten totally leaked that uh they just decided to add that. And
2:58:172 heures, 58 minutes et 17 secondeshonestly, I think they should just make it a mandatory thing. There are a few instances where you know you can't really do that. But yeah, I think like they should just default to that and
2:58:242 heures, 58 minutes et 24 secondesthen RLS should be like opt out, not opt in. All right. And the end result is super clean. We now have this working functionally on both our database and
2:58:322 heures, 58 minutes et 32 secondesthen also our local. So, if I go to profile here and then sign out, you see we now have a pretty clean uh login page. I won't say this is perfect, but
2:58:412 heures, 58 minutes et 41 secondesbasically I went on this website here, Dribble, and then I found a couple of sign-in pages that I liked. And then I just fed one in particular, this one,
2:58:482 heures, 58 minutes et 48 secondesinto Claude saying, "Hey, can you build me something kind of like this for my sign-in page?" Uh, and the end result is, you know, this we got these cute little calories and weights and stuff
2:58:562 heures, 58 minutes et 56 secondeslike that going up and down, and it's nice and I already have an account, so when I sign in, we just jump directly into the app. And there there are a couple of issues. I've noticed like the
2:59:042 heures, 59 minutes et 4 secondesonboarding flickers very briefly. Uh I'm going to fix all that right now with Claude. And that's actually what what it's doing in the background. It's fixing some of the minor usability issues now that we have a database. Um
2:59:122 heures, 59 minutes et 12 secondesfor instance, if uh I reload this page, you notice that it takes a second for this thing to toggle. And that's because it's actually pulling that directly from the database. So I don't want that to
2:59:212 heures, 59 minutes et 21 secondestake a second. You know, I just want it to be cached. So I'm going to go through now. It just implements some additional app functionality like you guys have already seen me do. Now, what I have it doing is I'm having it loop over
Chapitre 32 : Enhancing App Functionality
2:59:302 heures, 59 minutes et 30 secondesrepeatedly and then open up every individual page in the app, which is fairly easy to do. You basically just say, "Hey, I want you to open up every individual page of the app and then
2:59:382 heures, 59 minutes et 38 secondesidate small improvements that it could make to the usability and then the speed by which the app loads and then works." Um, this is sort of a a meta system
2:59:462 heures, 59 minutes et 46 secondeswhere the AI is now doing both the ideation and the implementation for me.
2:59:502 heures, 59 minutes et 50 secondesThen I basically just like take a quick peek at everything after all is said and done and verify whether or not it's good. Um, and as you can see, it's now adding styles for water and weekly cards
2:59:582 heures, 59 minutes et 58 secondesand and stuff like that, too. This is a form of accessory functionality, right?
3:00:023 heures et 2 secondesLike save as favorite is not something that I necessarily need the app to have, but you know, I want to polish it up before I actually end up submitting this to the app store. So, I want this to
3:00:103 heures et 10 secondeshave more or less everything that I think an app would realistically need to be on par with or on the same level as Cali. And it's all just a byproduct of token usage, right? I have this running
3:00:193 heures et 19 secondesrelatively autonomously right now. It's been 24,000 tokens spent for almost 6 minutes. you know, if you can budget that level of token spend, you can
3:00:263 heures et 26 secondesbasically trade your money for tokens for time and then get that time back to do whatever else you're doing. Now, while I was using this on my phone, I found that it was taking a little while
3:00:343 heures et 34 secondeslonger than I wanted it to. Um, I noticed that every time I log something, it would take like a good 700 milliseconds to maybe a second in order
3:00:433 heures et 43 secondesfor that log to go through. And that was just annoying to me. I don't want this to take a very long time. I understand that you should know that any calorie
3:00:503 heures et 50 secondestracking or whatever that I'm doing on my Chrome is always going to occur faster than on my mobile simply because I have way more processing resources on hand on my computer than I do on my
3:00:583 heures et 58 secondesphone. So, generally whatever it feels like on your computer, it's going to feel twice as worse on your phone. And um when I moved over to my phone, I I
3:01:063 heures, 1 minute et 6 secondesfound that. So, what I did is in addition to asking it to assist me with design and so on and so forth. Okay, right over here at the very top, I also
3:01:163 heures, 1 minute et 16 secondesasked it, hey, what and it looks like it just knocked that out, which is unfortunate. Um, hey, what sorts of changes are currently contributing to
3:01:243 heures, 1 minute et 24 secondeslike the very long load times and you can see that uh it looks like most of these now are significantly faster. So,
3:01:323 heures, 1 minute et 32 secondesthis one here, for instance, went from 417 to to 399. This went from 393 to 389. Uh, but it looks like, you know,
3:01:403 heures, 1 minute et 40 secondesultimately speaking, we had some improvements. I think because we're doing a single call to the database or something like that, it's going to save something like 600 milliseconds on
3:01:483 heures, 1 minute et 48 secondescellular. And then I also had it do a little full reload test to see how fast all the stuff is. So, um, how much
3:01:553 heures, 1 minute et 55 secondesfaster is home now that we've done the improvement? It looks like we're getting it down from 355 to like 221 or
3:02:033 heures, 2 minutes et 3 secondessomething like that. Yeah, average time of 254 down to 219 milliseconds. So, we basically made the entire app a good like 14% uh faster. And then it's
3:02:123 heures, 2 minutes et 12 secondessuggesting that on, you know, some form of like LTE or something like that, we went from 560 milliseconds, which is about half a second of pure network latency. That's kind of like what I was
3:02:203 heures, 2 minutes et 20 secondesfeeling uh before, to about 80 milliseconds of network latency, which is about half a second saved. So, I mean, that's that's really more or less what you need to do. uh if you really
3:02:293 heures, 2 minutes et 29 secondeswant it to work like super snappy on your phone, you need to trade even more tokens in order for some some optimizations like this. But the issue is because I've now kind of made a
3:02:373 heures, 2 minutes et 37 secondescouple of changes to the core thing while I was testing on my phone, I have to go back and I have to test it all over again. So, what I'm going to do now is I'm going to roll it back. I'm going to test it fully end to end on Chrome
3:02:463 heures, 2 minutes et 46 secondesand then I'm going to do iPhone mirroring and then I'm going to do my phone. It is annoying to have to do this over and over and over again, but there's just no other way to fully know.
3:02:533 heures, 2 minutes et 53 secondesUh my goal is, you know, I want this thing to be basically publishable ready at the end of my about. I don't want to have to send this off to some QA team or anything like that. I'm doing it all
3:03:003 heures et 3 minutesmyself with Claude. Um, so I'm just going to give it another maybe 10 or 15 minute test and then I'll let you guys know where I'm at. Okay. And I just tested this antenna and it's looking
3:03:083 heures, 3 minutes et 8 secondesreally clean, but there was one tiny thing that wasn't working, which is uh the bar at the very top of the page,
3:03:153 heures, 3 minutes et 15 secondeswhich is now black, was white. What I mean by that is those little icons like my time, uh my battery, my Wi-Fi signal, and my cell signal. Those just blended
3:03:243 heures, 3 minutes et 24 secondesinto the background. And it's one of those things that like you just can't know until you do the full endto-end test and actually run through everything on your phone. So now that I've fixed
3:03:303 heures, 3 minutes et 30 secondesthis just by saying, uh, hey, you know, my iPhone's native top bar icons are white, all this stuff. Is there any way to fix? How do I force the colors? You know, without me having done so, I never would have actually got to this point.
3:03:403 heures, 3 minutes et 40 secondesThat would have been like a serious clear usability problem. Now that it's fixed, though, it's it's really clean.
3:03:443 heures, 3 minutes et 44 secondesAnd you can see that the camera's in use and, you know, everything is basically uh actually totally functional now, which is quite awesome. Also, uh, because I don't have a giant plate of
3:03:523 heures, 3 minutes et 52 secondessteaming rice in front of me, what I did is I took a photo of my screen with all of that on and just confirming that that still managed to work. Although, I did for some reason get slightly lower fat
3:04:013 heures, 4 minutes et 1 seconderatings and more protein. So, yeah, it's a hell of a deal. Hey, if you want more protein in your diet, just take a photo of food on your screen instead of in
3:04:083 heures, 4 minutes et 8 secondesreal life. Okay, so with all that said, um we now have done more or less everything that we need to do uh to actually push our app live except for
3:04:173 heures, 4 minutes et 17 secondesprobably the most boring thing, which is the security audit. The good news is the security audit, as I've shown you guys with the previous app build, is very simple and it's very straightforward.
3:04:263 heures, 4 minutes et 26 secondesSo, all I'm going to do is I'm just going to start by clearing all of my um conversation history. So, I'll go back slashcle. Okay. And so, now we're basically starting a new conversation, which is why the tokens are down to 0%.
3:04:363 heures, 4 minutes et 36 secondesAnd I'm going to go back to my app or my Chrome. And then I'm going to go and search up security for Vibe coded apps.
3:04:443 heures, 4 minutes et 44 secondesOkay, which is the um asset that I've given people in previous courses that basically runs through this big security audit. And just like I did last time,
3:04:523 heures, 4 minutes et 52 secondesI'm just going to copy this puppy, paste it in, and I'm making sure it's a new prompt. Okay, I'm just going to have it go end to end analyze everything in uh
3:05:003 heures et 5 minutesyou know, this repo and then give me those changes. And I'm not going to have you guys be on the edge of the line for this because again I feel like you you probably understand the point. Just AI
3:05:083 heures, 5 minutes et 8 secondesrunning through everything in a very comprehensive sort of line by line security basis. And it just ran through a final security check as well as a
3:05:153 heures, 5 minutes et 15 secondesgeneral sort of functional QA audit. Uh what I'm going to do now is I'm going to do that three test sequence starting on my computer then iPhone mirroring and then finally expo on my phone. And
3:05:243 heures, 5 minutes et 24 secondesthat's that. Now that we've done everything involved in creating an app that has AI functionality, why don't we wrap this up with a third app? This
3:05:313 heures, 5 minutes et 31 secondesone's sort of going to be a mixture between the habit tracker and then the AI tracker. Very simple and straightforward. Pomodoro or time tracking app that I'm going to implement
3:05:403 heures, 5 minutes et 40 secondessome cool design stuff in. In short, we're going to have something that grows as our time tracker goes up and up. And I also want you to know you don't just have to do a tracker. I've done three
3:05:483 heures, 5 minutes et 48 secondesversions of trackers now. A habit one, a calorie one, and then also a a time one.
3:05:533 heures, 5 minutes et 53 secondesBut a tracker just happen to be one of the easiest and simplest ways for me to show you guys how all this stuff works under the hood. Uh, with all that said, let's get into it. All right. So, my next app is going to be a pomodoro app.
3:06:043 heures, 6 minutes et 4 secondesFor those of you guys that don't know, there's this whole idea of uh pomodoros for productivity. And a pomodoro is just a 20 to 25 minute uninterrupted work
3:06:123 heures, 6 minutes et 12 secondesblock where you just sit down and get things done. And the idea is this is how you train your focus and your ability to remain productive over long periods of
3:06:203 heures, 6 minutes et 20 secondestime. You do a 20-minut period to take a 5minut break. You do another 20-minut period and so on. The next week you do a 25m minute period and then a 5-minute
3:06:273 heures, 6 minutes et 27 secondesbreak and then another 25m minute period and you know you eventually just build that up. So I'm just going to call this a Pomodoro app. Okay. And just like we
3:06:353 heures, 6 minutes et 35 secondeswent through the whole app design framework for the Cal AI lookalike here, I'm going to go through the whole app design framework for the Pomodoro. So I'm just going to copy that over. Okay.
3:06:443 heures, 6 minutes et 44 secondesKind of stick it right over here.
3:06:473 heures, 6 minutes et 47 secondesMaybe move that up so that it doesn't kind of get in the way. And then um yeah, you know, just like the one thing for calorie tracker app was the calorie tracking. Uh the one thing for the
3:06:563 heures, 6 minutes et 56 secondesPomodoro app, just logically speaking, let me just copy this to make my life easier is going to be um timers and
3:07:033 heures, 7 minutes et 3 secondesit'll be like adjustable timer. And so you'll be able to set, you know, like a 20 or 25 or 30 minute timer and increase maybe the length of that over time.
3:07:113 heures, 7 minutes et 11 secondesOkay, the core loop because the app is so simple, we're going to need something cool to kind of keep people coming back.
3:07:183 heures, 7 minutes et 18 secondesAnd so the core loop in this case is going to be uh you set the timer, you you know I think I think we're going
3:07:263 heures, 7 minutes et 26 secondesto start with planting a tree and then you watch it grow and then you know it like dings when you're done and then it looks awesome. Um the whole idea here is
3:07:343 heures, 7 minutes et 34 secondesbecause the actual app is so simple. Uh we're going to add like a tremendous amount of visual polish and appeal and kind of add like some cute interactivity
3:07:423 heures, 7 minutes et 42 secondesthat despite not actually being like a feature is just going to keep people actually like on the app. And the whole idea is like you're going to take your phone, you're going to put it kind of on your desk, you're going to click the
3:07:503 heures, 7 minutes et 50 secondesthing, and something is slowly going to grow, let's say, as you go through uh go through that pomodoro. And we see this a lot with apps nowadays. They like the
3:07:583 heures, 7 minutes et 58 secondesidea of you growing and taking care of something. It's kind of cool. You plant a tree and and so on. In terms of accessory features, we'll definitely
3:08:053 heures, 8 minutes et 5 secondesneed a few. So, um I want the ability to like map Pomodoro or maybe log Pomodoro.
3:08:133 heures, 8 minutes et 13 secondesNo, uh track progress. Let's do that. So you can see your pomodoros. Um, basically have like a log of them and so on and so forth, similar to what we had
3:08:213 heures, 8 minutes et 21 secondespreviously. And then you should also have the ability to, I don't know, like change the thing you're growing and maybe like earn levels and and colors
3:08:303 heures, 8 minutes et 30 secondesand etc., you know, some sort of award for growing your your tree longer than other people. Terms of the surface area, um, I don't think we're really going to have much more than just like the growth
3:08:383 heures, 8 minutes et 38 secondesscreen and then maybe like the I don't know, maybe like progress or tracking or uh log or something like that. Maybe maybe just growth and then log. I think
3:08:473 heures, 8 minutes et 47 secondesthat seems pretty cool. And then the retention hook is just going to be you getting checked in with. So maybe like daily check-ins about your productivity
3:08:553 heures, 8 minutes et 55 secondesand your performance. Uh hey, you know, if you want to keep growing that tree, then circle back. You haven't logged a thing in a certain amount of time. Okay,
3:09:033 heures, 9 minutes et 3 secondesthat that seems pretty simple. And then uh I'm actually just going to walk through this whole thing left to right.
3:09:073 heures, 9 minutes et 7 secondesI didn't do a very good job of that the last time. So I'm actually going to walk through this whole thing left to right with you guys. Um and kind of check everything off as we go.
3:09:153 heures, 9 minutes et 15 secondesAll right. So, what does that mean? That means that we have now kind of finished our MVP ideation. And so, we sort of have the MVP all laid out. All we have to do now logically is we have to uh
3:09:233 heures, 9 minutes et 23 secondesactually give that to Claude. And so, the first thing I'm going to do is I'm just going to go back to my anti-gravity instance where I was setting up Google
3:09:313 heures, 9 minutes et 31 secondesPlay developer and then console registration and then some other stuff for the Cal Tracker app cuz I wanted to submit that to the App Store. Then, I'm just going to go up to the top here, go
3:09:393 heures, 9 minutes et 39 secondesnew window. That way I can just open up another window. Then here I'm going to call this Pomodoro app. Okay. And then
3:09:473 heures, 9 minutes et 47 secondesI'm going to open. And now we're inside of the Pomodoro app. That's why it says so in the top lefthand corner. And just double tapping on this opening up my little claw window. It's kind of annoying how many steps you have to do.
3:09:563 heures, 9 minutes et 56 secondesYou could also open it um down here, but I just think this is faster. And then once we're here now, I can just say I want to create a mobile app using React
3:10:053 heures, 10 minutes et 5 secondesNative and Expo. Um set up the workspace for me. assuming I intend to launch uh
3:10:123 heures, 10 minutes et 12 secondesboth Android and iOS versions. Okay, so now we're just going to have this run through the setup just like we did the other couple times. Build out our little
3:10:203 heures, 10 minutes et 20 secondesscaffold, and then once we have the scaffold, I'll actually add all of the functionality needed. I'm building an app with a five-step framework of core function, core loop, accessory features,
3:10:293 heures, 10 minutes et 29 secondesuh surface area check, and then retention hook. The app that I'm looking to build is essentially a Pomodoro style
3:10:363 heures, 10 minutes et 36 secondesuh time tracker. The core function will be the ability to track time and then adjust the time that you are tracking.
3:10:423 heures, 10 minutes et 42 secondesThe whole idea being this app will help improve your focus. Now the loop is going to be highly visual based. What I'd like is I'd like a function where
3:10:513 heures, 10 minutes et 51 secondeswhen you start a pomodoro you're basically planting a seed and then over the course of the pomodoro the seed grows into a full tree. This needs to be
3:10:583 heures, 10 minutes et 58 secondesvery visually stimulating uh look kind of cute and be in a particular visual style. I kind of want this to look almost like an like an anime, like an
3:11:053 heures, 11 minutes et 5 secondesanimated uh sort of TV show. When it's done, you know, I want the phone to sort of vibrate. So, I want like haptic feedback. I also want, you know, a bunch
3:11:143 heures, 11 minutes et 14 secondesof visual stimulatory uh kind of functionality. For accessory features, I want the ability to track our progress, sort of like a log. Basically, as the
3:11:223 heures, 11 minutes et 22 secondesuser does more and more and more uh pomodoros and then gets more focused, I want the progress bar to show them improving in both their times and so on
3:11:303 heures, 11 minutes et 30 secondesand so forth. I also want the trees or seeds or whatever feature we end up on uh to change. So, I want like different colors. I want the trees to change in
3:11:383 heures, 11 minutes et 38 secondesnature, maybe progress through like a different series of trees. I want you to earn levels and and colors and stuff like that. For a surface area check, I
3:11:463 heures, 11 minutes et 46 secondesreally only think we need two main screens. Maybe a growth screen, which is where you plant the seed and then it grows and, you know, begin the Pomodoro
3:11:533 heures, 11 minutes et 53 secondessession. And then some sort of log where you can see progress over time. I don't think it needs to be more complicated than that. Uh, and then the retention hook, the thing that's going to keep
3:12:023 heures, 12 minutes et 2 secondesthem coming back is going to be a daily check-in where if you don't come back, let's say, you know, in a 72-hour period, then your trees start withering
3:12:093 heures, 12 minutes et 9 secondesand dying. And maybe you plant one tree uh for every Pomodoro session, and the whole idea is you'll eventually build a forest.
3:12:183 heures, 12 minutes et 18 secondesOkay, so I just did that while this was building. Uh, so what I'm going to do now is I'm just going to press enter here and uh, you know, I'm just going to have this thing run through the build
3:12:263 heures, 12 minutes et 26 secondesfull end to end. Now what this is doing which is a little bit different this session than the previous ones is it's actually going through and planning and then also exploring the project state
3:12:343 heures, 12 minutes et 34 secondesand then researching some animation libraries and it's doing so using uh what's called their sub aent teams feature and you can see that actually
3:12:423 heures, 12 minutes et 42 secondesjust exited but basically we have like a main thread which is what I'm running right now and then we have another sub agent that's operating alongside us and this one is researching react native
3:12:503 heures, 12 minutes et 50 secondesanimation libraries. Now, every time this finishes, it'll collapse back to the main thread uh and then, you know, just give as much context as humanly possible to uh the the the main agent
3:12:593 heures, 12 minutes et 59 secondesthat's sort of listening to us. Now, in addition, you can see we've also switched over to plan mode, which is a little bit different from uh you know,
3:13:063 heures, 13 minutes et 6 secondesthe other sort of oneshot modes that we've operated at before. And Cloud will do this from time to time. They'll typically use plan mode when it needs a little bit more information from you and it intends to ask you some questions.
3:13:153 heures, 13 minutes et 15 secondesAnd so, you guys can see here it's asking me some questions. So, it's saying for the tree growth animation, should the tree grow in real time as the counter counts down, eg at 50% time, 50%
3:13:253 heures, 13 minutes et 25 secondesgrown, or should it be a pre-made animation that plays on completion? Now, we want real-time growth for sure. For data persistence, uh session history,
3:13:333 heures, 13 minutes et 33 secondesforest state levels, which approach should you prefer? I want local SQLite.
3:13:363 heures, 13 minutes et 36 secondesThat just means doing it all locally on my computer for now. What default Pomodoro duration do you want? And should users be able to customize it?
3:13:423 heures, 13 minutes et 42 secondesWe'll do 25 minutes. And then we can actually submit all these. And you'll see most of the time it'll actually just like recommend an option. And in this case, all of these recommendations are
3:13:503 heures, 13 minutes et 50 secondeswhat I initially wanted. But, you know, Cloud wanted to make 100% sure that if I wanted something else, we could get it done now as opposed to later after we're done with all the the token usage. Okay.
3:13:593 heures, 13 minutes et 59 secondesSo, now it's going to actually go through, you know, building this SVG that grows. SVG is like sort of a design and we'll see how it looks. I don't
3:14:073 heures, 14 minutes et 7 secondesactually have high hopes for the design functionality yet. I think we'll probably have to go pretty in-depth there. But, you know, if it could oneshot it, uh, that would be that would be fantastic and very much preferable.
3:14:163 heures, 14 minutes et 16 secondesCool. And it's already opened up the little app here. Uh, I had it use Chrome DevTools MCP, which is a tool that allows it to take screenshots of things
3:14:243 heures, 14 minutes et 24 secondesas it does the building. And that's what's going on right now. You can see it's stuck on the loading page. So, it's just going to fix that sort of while I'm uh explaining the way that this app
3:14:333 heures, 14 minutes et 33 secondesworks to you guys. And so, we have two pages, you know, we have a grow page and then we have a forest page. And I actually like this. I think that's split up a lot better than uh you know what I
3:14:403 heures, 14 minutes et 40 secondeswas considering previously. The grow page is obviously going to be where you log a session and then it's going to grow. And then the forest page is presumably just going to be a big list
3:14:483 heures, 14 minutes et 48 secondesof all the things that you've uh you know all the trees that you've sort of grown before. Now it's very simple. This is not like a high quality sort of SVG
3:14:573 heures, 14 minutes et 57 secondesanimation at least as it stands. You can see this is sort of off to the left and so on and so forth. So uh we're just going to make a couple changes to the app. make it all small and then yeah can
3:15:053 heures, 15 minutes et 5 secondeskind of continue working our way through this until we get it to a point where it like works. Then once we've got it to the point where it works I'm going to check that little built box and then
3:15:123 heures, 15 minutes et 12 secondesmove on to optimizing the design. All right, so just taking a look at the app.
3:15:163 heures, 15 minutes et 16 secondesWe have an onboarding screen here. Just uh going to make this kind of mobiley.
3:15:213 heures, 15 minutes et 21 secondesThis onboarding screen says plant a seed. You can see there's some sort of issue with this um chart. After you plant the seed, you'll grow your tree.
3:15:283 heures, 15 minutes et 28 secondesYou'll kind of earn XP to unlock new species and then you'll tend to your forest and your forest look kind of like that. So, this does look really neat.
3:15:343 heures, 15 minutes et 34 secondesIt's super cute. I like this. Um, couple of issues here already. One of the issues is, you know, this is obviously not big enough to encapsulate uh the
3:15:423 heures, 15 minutes et 42 secondescontent. Or it may be that I'm just a little too zoomed in. But regardless, like these things should not just be on one line. We should obviously have that
3:15:493 heures, 15 minutes et 49 secondesspill over, right? And then I don't much like the layout of this app as it stands anyway. So, I mean, you know, if I go
3:15:563 heures, 15 minutes et 56 secondeshere and then make this a little taller so I can plant the seed, you can see that we planted the seed. The issue is I can't really see this grow, right? So,
3:16:053 heures, 16 minutes et 5 secondesthat kind of sucks. I'm just going to give up. Go back to the forest page. You can see we have these sessions, number of hours that we've logged, streak, level one, unlocked oak. This is cool.
3:16:133 heures, 16 minutes et 13 secondesThis is exactly what I wanted. A certain number of trees in your forest, then recent sessions. So, what we're going to have to do like just to really test the UX and stuff like that is we're we're going to need just need to add a bunch
3:16:213 heures, 16 minutes et 21 secondesof entries to the database. So, I'll say add a bunch of entries to the database that I could see what this app would look like if it was fully populated.
3:16:273 heures, 16 minutes et 27 secondesWe'll need to do this if we are in uh to, you know, adjust the design and so on and so forth. Anyway, this still looks pretty good. I'm pretty happy with the way that is. I'm just going to go
3:16:343 heures, 16 minutes et 34 secondesback to this Excalad draw and I think meaningfully mark off this build because uh you know, this has most of the functionality that I wanted. From here on out, it's just going to be sort of a design loop like we did last time.
3:16:433 heures, 16 minutes et 43 secondesSlowly and consistently upgrading the design until we eventually get to a point where, you know, we we love the way the app looks. Um I'm also just going to start voice dumping all of
3:16:513 heures, 16 minutes et 51 secondesthese minor changes u just directly into Cloud as it continues to build. And you can see it's already started adding stuff to the database. We're at a
3:16:593 heures, 16 minutes et 59 secondescertain level. If I go back to my forest here, you see, okay, it actually doesn't look like we have all of this in yet, but we do have the sessions, which is nice. And the exp. So, that's wonderful.
3:17:083 heures, 17 minutes et 8 secondesI think this looks pretty solid right now. Um, forest is looking cool, too. My main issue is on the grow page, the
3:17:183 heures, 17 minutes et 18 secondestimer options of 15, 25, 45, and 60 minutes do not are not currently responsive.
3:17:263 heures, 17 minutes et 26 secondesAdditionally, the way the page is vertically laid out is there's a tremendous amount of space up at the top that is empty until the tree grows. This makes the app look kind of ugly and
3:17:343 heures, 17 minutes et 34 secondesweird uh until the tree actually goes through that that growth animation. And uh I don't want to have to scroll.
3:17:413 heures, 17 minutes et 41 secondesIdeally just want everything visible. So we need to find a way to make this app much more responsive for all different types of devices and then uh and then
3:17:483 heures, 17 minutes et 48 secondessolve that as well. Also, because of the lack of responsiveness, the forests are currently cut off. ag you can't actually see the tops of all
3:17:563 heures, 17 minutes et 56 secondesof those trees um on the on the homepage.
3:18:003 heures et 18 minutesAdditionally, I just I just like us to make the homepage significantly more visually engaging. Use best practices for uh mobile apps. Right now, we only
3:18:093 heures, 18 minutes et 9 secondeshave the level marker. We have the little fire marker and then we have the the time and then obviously the uh timer. But I think we'll need to
3:18:173 heures, 18 minutes et 17 secondessignificantly upgrade this both from a design perspective, but also like a font choice perspective, also like a usability perspective, uh, and so on and so forth.
Chapitre 33 : App Performance Insights
3:18:303 heures, 18 minutes et 30 secondesOkay, so I do like this. Um, I also like the trees withering aspect. So I think this is the trees that are withering.
3:18:363 heures, 18 minutes et 36 secondesThat's probably what those are. Although it says two trees and I'm seeing three.
3:18:403 heures, 18 minutes et 40 secondesSo there may be an issue with that database there. Um, but yeah, this is pretty cute. Uh, ideally what I'd like to do is I'd like to significantly upgrade the design of all these trees
3:18:483 heures, 18 minutes et 48 secondesbecause, you know, as it stands right now, it's just a couple of circles. I think we could do so by maybe grabbing these assets from somewhere else instead
3:18:553 heures, 18 minutes et 55 secondesof just making them ourselves. Um, that'd be nice. And then I think we should be able to click into the recent sessions, too. Add functionality so we
3:19:043 heures, 19 minutes et 4 secondescan click into a recent session. Right now, the recent sessions are sort of a log, and that log is fine, but we actually want to be able to click in on them and see. also add a graph of some
3:19:123 heures, 19 minutes et 12 secondeskind underneath the forest section under a forest uh on the forest page, sorry.
3:19:183 heures, 19 minutes et 18 secondesSo that we could see that. Also, right now I'm seeing a notification that says two trees withering, but uh the actual visuals make it look like three trees
3:19:253 heures, 19 minutes et 25 secondesare withering. We should identify the the withered trees a little bit better so users can see what's going on. And uh you should be able to interact with each
3:19:333 heures, 19 minutes et 33 secondesof these things like aka you should be able to maybe tap or nudge on the trees to make something happen. In addition, these trees should be animated. Right
3:19:413 heures, 19 minutes et 41 secondesnow, they're not really animated. It's just a a static tree. And despite how cute that is, the user is definitely going to want uh it to be a lot more engaging than that. We also need a way
3:19:493 heures, 19 minutes et 49 secondesto see what happens when we actually make it to the end of a Pomodoro. Right now, um you know, I'm just looking at this app on a static basis. I don't actually know what the tree looks like
3:19:573 heures, 19 minutes et 57 secondesas it grows. So, ideally, we'd want a way to trigger all the animation states that I could take a look and then maybe help you modify them more granularly.
3:20:053 heures, 20 minutes et 5 secondesUh, and then I also want to wait just to be able to trigger it. Uh, finished dumping all that stuff in while it's continuing making other changes. You can
3:20:133 heures, 20 minutes et 13 secondessee it's now adjusting uh the little exp bar at the top. That's cool. And then it's also changing the the vertical spacing. Uh, it's making the forest sort
3:20:213 heures, 20 minutes et 21 secondesof like fixed, which is nice, but obviously we are still cutting off that top. I think I'm actually just going to like significantly change this design.
3:20:283 heures, 20 minutes et 28 secondesUm, I mean like as much as I like the way that it's laid out, I don't really like the colors and I think we're going to have to like really change the fonts in order to make this nice. So, why
3:20:353 heures, 20 minutes et 35 secondesdon't I go over to our lovely friend Dribble here? And then why don't we see I don't know, tracker app. We do that.
3:20:433 heures, 20 minutes et 43 secondesIs there like a time tracker app or something like that? Anyway, I like this. This looks really cool.
3:20:493 heures, 20 minutes et 49 secondesI'm not seeing a time tracker app specifically.
3:20:533 heures, 20 minutes et 53 secondesUh, some of these are all right. Oh, this one literally says Pomodoro. That's kind of cute. Uh, we might be able to make some use of that.
3:21:003 heures et 21 minutesYeah, these are time tracker apps for sure. Just zooming in here. I like this.
3:21:043 heures, 21 minutes et 4 secondesI like this design. Good mood, new day, fresh start. How well did you sleep today? It's kind of a sleep tracker, but do you notice how it's like it's got this nice sort of warm color scheme to
3:21:123 heures, 21 minutes et 12 secondesit. And then also we have these um little graphs. I think this would be great from a graph perspective.
3:21:183 heures, 21 minutes et 18 secondesThis is the Pomodoro tracker, which is really interesting. Uh I think this is probably a little too much. What's the next page look like? Okay, it's just a
3:21:253 heures, 21 minutes et 25 secondesmockup. Hey, how about this one? Okay, we actually have the time tracker, tracking history, ongoing projects. I think this is probably like the best
3:21:333 heures, 21 minutes et 33 secondeslittle design that I've seen so far. So, let me just take a look at a couple other ones. Maybe just tracker app instead of time tracker app. That should
3:21:413 heures, 21 minutes et 41 secondesat least show us more. Moody area. That looks pretty cute. I like that.
3:21:483 heures, 21 minutes et 48 secondesJust taking a look at all the possible options here. You know, I want it to be fun and sort of like I don't know like like youthful, like kidlike almost.
3:21:593 heures, 21 minutes et 59 secondesI like this. This is very cute, too. You see with the sort of outlines here?
3:22:043 heures, 22 minutes et 4 secondesThat's super cute. Although, I I'm realizing this has more to do with the pictures than it has to do with anything else. What we could also do is we could
3:22:133 heures, 22 minutes et 13 secondeshave GPT image generate a couple of designs for an app like this and then feed in those designs to Claude and have it try and reproduce and recreate it.
3:22:223 heures, 22 minutes et 22 secondesThat might be not a not a bad idea. Why don't I try that? So, I'm going to I'm just going to use a slashbtw feature here to allow me to ask Claude questions
3:22:293 heures, 22 minutes et 29 secondesabout this app while it works. So, I'll say describe this app in a prompt feeding into an image generator um so it can come up with a
3:22:373 heures, 22 minutes et 37 secondesan indepth design uh you know set of designs. Let's try that. Now, uh GPT
3:22:443 heures, 22 minutes et 44 secondesimage 2 is one of the better AI image generators right now. So, this can actually generate total like mockups for mobile apps and stuff. And the idea is
3:22:533 heures, 22 minutes et 53 secondeswe're going to take this this mockup idea, feed it to GP2, GPT2 image or image 2, and then uh once it has this, we should be good. Okay, so I now just
3:23:013 heures, 23 minutes et 1 secondefed all of this in to GPT image, and we'll see how it does. Awesome. We now have these designs, and these look a lot cleaner. And this is more or less what I wanted. I wanted something that had, you
3:23:103 heures, 23 minutes et 10 secondesknow, fantastic textures. Uh I love how that it's actually somewhat similar to our app right now, actually, with a
3:23:173 heures, 23 minutes et 17 secondeslittle field and stuff. Um I want to see this thing grow, right? I think that's really important to me. This is the forest with a bunch of information. And
3:23:253 heures, 23 minutes et 25 secondesyou can see it's actually kind of mimicked the structure and layout. Uh, which is telling me that really the thing that we're lacking is just like the visual assets right now. The the
3:23:333 heures, 23 minutes et 33 secondesactual forest bit looks good. I think it's generated multiple of these. Okay. Yes, it has generated multiple of these.
3:23:393 heures, 23 minutes et 39 secondesUm, this this is really the main screen I think that we need to focus on. And then we could see it sort of grow in the background here too. I am curious how
3:23:473 heures, 23 minutes et 47 secondeswe're actually going to implement something like that because obviously we're going to need to design like really high quality assets. Um I think what we could probably do is we could
3:23:543 heures, 23 minutes et 54 secondesjust generate each of these trees in a sequence and then maybe extract them uh and then add some sort of animation
3:24:013 heures, 24 minutes et 1 secondewhere like the the little things sort of move around and the leaves rustle and so on and so forth. Oh, and this is going to be the onboarding screen which I
3:24:093 heures, 24 minutes et 9 secondesthink is going to look fantastic. The other pages here also look really clean.
3:24:133 heures, 24 minutes et 13 secondesOh, that's beautiful. Okay, great. So, I think what we can do is we could probably just feed in these directly and say, you know, I want you to build the
3:24:203 heures, 24 minutes et 20 secondesonboarding just like this. So, I'm scroll down here and I'll say these are the four onboarding screens. I want you to design the app onboarding screens to
3:24:283 heures, 24 minutes et 28 secondeslook exactly like this. I want you to standardize the design, the colors, and everything so that it follows uh this
3:24:373 heures, 24 minutes et 37 secondesstructure. And I want you to screenshot loop over and over and over again until you get it down so that it's just about pixel perfect. There are minor changes
3:24:453 heures, 24 minutes et 45 secondesin position of certain buttons etc. So it doesn't need to be exactly pixel perfect with the placement of elements but it should look the exact same outside of that. Okay. And then I think
3:24:543 heures, 24 minutes et 54 secondeswhat I'm going to do now that it's generated this I'll say this looks excellent. I want you to isolate all of the assets
3:25:013 heures, 25 minutes et 1 secondeall of the let's say image assets in these mockups. So the trees, the backgrounds etc and give them to me
3:25:103 heures, 25 minutes et 10 secondesas images so I can import them into the app. Okay. So now what it's going to do is actually like extract the asset. So
3:25:173 heures, 25 minutes et 17 secondesit should extract this picture for instance. It should extract these for instance. It should extract this image and so on and so forth.
3:25:263 heures, 25 minutes et 26 secondesUh I can't actually do this, you know, I can't actually proceed until we get those images. So what I'm going to do is I'm just going to create a new folder here and I'll call this images.
3:25:333 heures, 25 minutes et 33 secondesYou can find the images for each section in images.
3:25:413 heures, 25 minutes et 41 secondesAnd then I'm just going to upload all the images there. And this is going to be kind of hit or miss. I mean, um, you know, obviously some of this design may
3:25:483 heures, 25 minutes et 48 secondesnot necessarily be reproducible procedurally, right? Like for instance, this little button background, you know, it's kind of like patchy, almost like a
3:25:563 heures, 25 minutes et 56 secondeswatercolor. Same thing with this. And I mean, where are we going to get an animation that looks like that, right?
3:26:003 heures et 26 minutesI'm not entirely sure, but uh I think we can probably get most of it, which is what's important. There are also minor kind of issues with this. For instance, this is like an AI generated artifact.
3:26:113 heures, 26 minutes et 11 secondesThese images of these trees aren't all the same, which is kind of funny because obviously we're generating them with AI, but um when they're in our app, they'll
3:26:183 heures, 26 minutes et 18 secondesall be the same. And then we need to make sure these number of trees actually matches. I like this. This is a lot clearer than whatever Claude just generated before.
3:26:273 heures, 26 minutes et 27 secondesAnyway, we'll see how it goes. It's um now actually finalizing the image call.
3:26:313 heures, 26 minutes et 31 secondesCool. And we actually have some of these already, which is nice. Um I think Claude is going to have to know to cut this image, you know, in order to get
3:26:393 heures, 26 minutes et 39 secondesthe right section of the trees and stuff. So that's going to be a little tough, but I think we could still do this. I'm going to save uh we'll call
3:26:463 heures, 26 minutes et 46 secondesthis, I don't know, trees or something. I'm going to go back here and in images, I'm just going to drag in this. Oh, you know
3:26:553 heures, 26 minutes et 55 secondeswhat? I don't think we can actually do that, unfortunately. Uh, we have to open the folder in Finder first. And then we can go here and drag this into images.
3:27:073 heures, 27 minutes et 7 secondesThen I don't know why that's not allowing me to actually feed this in images. There we go.
3:27:133 heures, 27 minutes et 13 secondesSome of these images feature um multiple mockups. So you'll have to cut, crop,
3:27:213 heures, 27 minutes et 21 secondesdivide the image as needed. Before proceeding, perform these C cut crops
3:27:283 heures, 27 minutes et 28 secondesdivisions so that you end up with a straightforward list of assets for the
3:27:373 heures, 27 minutes et 37 secondesapp. And I'm just going to copy all these in sort of one by one. Oh, this looks great. Look at this. This is fantastic. So, I guess this grows into this. Oh, not necessarily.
3:27:493 heures, 27 minutes et 49 secondesIt looks like we have different colors here, which I think is important, too. So anyway, we'll download this as well.
3:27:553 heures, 27 minutes et 55 secondesAnd then rather than, you know, make this really complex, I think I'm just going to feed this image in like all of these images in one at a time.
3:28:033 heures, 28 minutes et 3 secondesI'll go back here. This is a lot of app images. Save that.
3:28:113 heures, 28 minutes et 11 secondesWhy don't I save that? Why don't I save that?
3:28:163 heures, 28 minutes et 16 secondesWe can also I don't know about these buttons. I don't know about these buttons. I think I'm going to do everything but these buttons.
3:28:233 heures, 28 minutes et 23 secondesSo now go back here and then what do we need? We need all three of these. So now I'm just going to drag them all in.
3:28:313 heures, 28 minutes et 31 secondesYou can see for whatever reason these didn't actually make it. So there you go. Okay. I'm going to go back here and then I'll say think hard as you chop them up. Important we get this right.
3:28:423 heures, 28 minutes et 42 secondesOnce done with that, loop over infinitely until the design is pixel is close to pixel. Perfect. Okay, this
3:28:513 heures, 28 minutes et 51 secondesshould now be everything that we need in order to actually design it uh to that style, which is quite nice. App is already starting to come together.
3:28:573 heures, 28 minutes et 57 secondesNotice how the fonts and the colors and everything like that look a lot better.
3:29:013 heures, 29 minutes et 1 secondeWe just have a background uh of this image right now, which is kind of black and white. And I think that's just because of the the way that the mockups were made. So, obviously, we're going to
3:29:093 heures, 29 minutes et 9 secondeshave to remove that background, but yeah, this onboarding screen is already looking a lot better. Cool. So, we have uh what looks to be pretty solid. The only issue I would say is this section
3:29:183 heures, 29 minutes et 18 secondeshere of like the nice blue sky. Looks a little odd, right? There's just something here with the nice blue sky slowly fading in that I don't think looks as good as it could.
3:29:283 heures, 29 minutes et 28 secondesThere's also some artifacting it looks like from the background removal on this image that we should remove. So, yeah, we just need to find a way to basically like make the top a little cleaner, I would say, and then it'll look great.
3:29:373 heures, 29 minutes et 37 secondesUm, but all all that's pretty good so far. I mean, I like the imagery and I like the way that it looks. Okay, top corners of these images, let's say.
3:29:493 heures, 29 minutes et 49 secondesOkay, bottom is now great, but the top corners of these images still look square, a bit square. Could we make the
3:29:583 heures, 29 minutes et 58 secondesgradients come in a bit more, but only on the top? And I think the idea there is that will basically give us more
3:30:063 heures, 30 minutes et 6 secondescircular basically. That'll basically give us like a nice little like rounded circle and then we won't even really queue into the idea that it's a uh you
3:30:143 heures, 30 minutes et 14 secondesknow an an image square that we're using. And yeah, I mean like that is gorgeous, right? Like that's pretty nice. I like this a lot. All right, that's looking a lot better now. Uh I
3:30:223 heures, 30 minutes et 22 secondesreally like this. Basically what we did is we just applied like a little gradient of this blue uh almost like a mask right around this almost like an arch. I think we could probably make it just 10% stronger. So I will do that.
3:30:343 heures, 30 minutes et 34 secondesBut as we go through the app here, you can see that, you know, aside from some image artifacting, we actually have something that looks pretty good.
3:30:403 heures, 30 minutes et 40 secondesGranted, this is an app, right? And uh we also have dynamic resizing and stuff like that, which is pretty cool. I like that. And yeah, I mean, we have we
3:30:483 heures, 30 minutes et 48 secondesbasically have like a good onboarding page now. So, I'm just going to proceed in this vein and replace all the assets with the AI image generated ones and then circle back when I'm done. All
3:30:553 heures, 30 minutes et 55 secondesright, perfect. This now looks exactly like how I wanted it to, very organic, and you can see it's sort of like built into the app. uh grows as we go taller
3:31:033 heures, 31 minutes et 3 secondesand we don't have that weird sort of vertical line anymore which is quite nice. So it's responsive. It's basically everything that we wanted. We can now move on. So you just fixed the
3:31:113 heures, 31 minutes et 11 secondesonboarding. It now looks fantastic. But the rest of the app does not look anything like the onboarding. So we'll
3:31:183 heures, 31 minutes et 18 secondesneed to continue rolling out the generated images and assets through the rest of the app. Continue top to bottom
3:31:273 heures, 31 minutes et 27 secondesensuring the design looks as similar as possible to the provided images. Take screenshots and loop as many times as you need to. You don't need to worry
3:31:343 heures, 31 minutes et 34 secondesabout the onboarding anymore since that's already done, but you do need to worry about the grow and the forest page. It should look identical to the
3:31:413 heures, 31 minutes et 41 secondesimages that I provided you inside of the images/folder. Okay, app is looking a lot better now. We have the seed right
3:31:483 heures, 31 minutes et 48 secondesover here. We can tap on the time to change it, which is kind of handy. So, we've removed that other section, making it even more visually simple. Then, we
3:31:563 heures, 31 minutes et 56 secondescan just click this little button and then our seed can grow. Um, I want to add just two additional pieces of functionality. The first is when I tap on the seed, I kind of want it to like
3:32:053 heures, 32 minutes et 5 secondesjiggle around a little bit. Add functionality so that when you tap on the seed, and really any tree on the grow page, there's a slight haptics and
3:32:143 heures, 32 minutes et 14 secondesthen it sort of jiggles around a bit, almost like it's organic or alive. And then change it so that you put the timer
3:32:223 heures, 32 minutes et 22 secondeson top of the tree when you click on the start timer.
3:32:283 heures, 32 minutes et 28 secondesWhat I mean by that is uh basically I want the seed to be sort of where the this is right now and then this will just be kind of up top slowly counting
3:32:353 heures, 32 minutes et 35 secondesdown. I think that makes more sense just because having this down below doesn't make sense if this is supposed to be like the ground and you can see this is
3:32:433 heures, 32 minutes et 43 secondesalready growing right which is quite nice. Um looks really really sexy that way.
3:32:483 heures, 32 minutes et 48 secondesAll right, cool. I mean aside from that if I go back to forest and come back you see this is still operating right which is quite nice. Um, we've manually, well,
3:32:573 heures, 32 minutes et 57 secondesnot manually, but we've adjusted all of the trees that have grown so far. And you can see there are different types of trees. There's like evergreens. There's uh I don't know, there's there's a lot.
3:33:043 heures, 33 minutes et 4 secondesWhen you tap on one, you can actually see the type of tree that was grown.
3:33:073 heures, 33 minutes et 7 secondesOkay. And then you can also see the health of the tree, which is kind of neat. And anything that's withering, you can unwither just by tracking like time right now. Um, so the oak is withering,
3:33:163 heures, 33 minutes et 16 secondesfor instance. For whatever reason, all all three oaks are withering, unfortunately. But I don't know, your your oak here looks pretty healthy, which is nice. You have the ability to
3:33:253 heures, 33 minutes et 25 secondestap on this as well. Uh, and yeah, I mean, like I think this is the the 80204 set app. We've also changed the fonts and stuff, too. Um, I don't like what happened here. It looks like Okay. Yeah.
3:33:363 heures, 33 minutes et 36 secondesSo, we do have that organic jiggle, but for whatever reason, the timer there stopped when I kind of went back here.
3:33:413 heures, 33 minutes et 41 secondesSo, I'm wondering if that is a persistent issue. No, that looks fine.
3:33:453 heures, 33 minutes et 45 secondesUm, we'll need to move that timer just a tiny bit higher. Move timer just a bit higher. Right now it's inter it's um on top of the sprout.
3:33:553 heures, 33 minutes et 55 secondesCool. Uh yeah. I mean I think we're just going to move that a little bit higher.
3:33:573 heures, 33 minutes et 57 secondesAnd then I like how there's like kind of a seed here. Sorry, not a seed, a cloud.
3:34:023 heures, 34 minutes et 2 secondesHigher. Still going to be on top of the tree. The next animation change.
3:34:083 heures, 34 minutes et 8 secondesSo I think aside from that, maybe we just need more clarification around levels and then we're done. I think that might be it.
3:34:193 heures, 34 minutes et 19 secondesThis just isn't really understanding that it's still on top of the Okay, that looks better. Uh, I'm just going to sit here and well, I'm not going to wait.
3:34:253 heures, 34 minutes et 25 secondesI'm just going to have it trigger all of the U images so that I could see the tree and make sure that nothing kind of weird weird gets cut off. But yeah, after that, I think we're basically good
3:34:323 heures, 34 minutes et 32 secondesto go. So, more or less it. And that's what this looks like. As it grows, we have some weird cut offs happening. So, we will need to fix that. But, it does
3:34:403 heures, 34 minutes et 40 secondeslook gorgeous. It's looking like a lot of these are cut off weirdly. Could you double check the source assets and ensure that we're not including additional trees above or below the main
3:34:493 heures, 34 minutes et 49 secondestree and we're also not cutting them off strangely? Yes, this is sort of our our dev mode. So you can see the pine and the trees and stuff like that grow. So I think when we fix this this will look
3:34:573 heures, 34 minutes et 57 secondespretty gorgeous. So now this is for instance a large sakura. Um and we can only do this by like holding it down and giving it a click. But yeah, all these
3:35:053 heures, 35 minutes et 5 secondesare beautiful and the crystal tree I think is probably the coolest of all. So I'm going to take my trusty pen and now mark the design stage off. It's now time
3:35:133 heures, 35 minutes et 13 secondesfor me to test this end to end. So, I'm going to do that using a combination of both Chrome and then um the iPhone mirroring app and then ultimately uh
3:35:223 heures, 35 minutes et 22 secondesexpo just on my device. So, I mean I'm just going to uh test this end to end now and I'll do it off screen. But I have a bunch of functionality here like I want to be able to tap this. I also
3:35:313 heures, 35 minutes et 31 secondeswant to be able to plant the seed. I want the timer to go up as I plant the seed. I have basically this little feature where I can now long press on it
3:35:383 heures, 35 minutes et 38 secondesto change the sprout. So, I'm just going to run through all that and then I'm also just going to go through the entire forest top to bottom and ensure that this functionality actually lines up. Like for instance, two trees withering.
3:35:463 heures, 35 minutes et 46 secondesYou know, it says three here. So, just going to go do a little end to- end pass and then circle back. All right. After a little bit of back and forth, maybe a little bit too much back and forth, uh we've now done all the testing as well.
3:35:573 heures, 35 minutes et 57 secondesSo, all that means for us is the last thing that we need to do, well, not last thing. I guess we're sort of halfway through the process, but the next thing
3:36:053 heures, 36 minutes et 5 secondeswe have to do is we have to add a database. Same thing that you guys have seen me do multiple times. I'm just going to do this on Superbase. I'll head over to new project and then I'm just going to call this uh Pomodoro app.
3:36:163 heures, 36 minutes et 16 secondesGonna just have this select a password for me, generate one, and then I'll copy this and then enable automatic RS as well. I'll head back over here to
3:36:243 heures, 36 minutes et 24 secondesanti-gravity and then I'll say uh superbase time. I'm going to feed it in a bunch of information after this project's created. Same sort of flow.
3:36:353 heures, 36 minutes et 35 secondesI'm just going to wait until all the stuff is set up. And I'm going to copy the project URL, publish, publishable key, direct connection string, etc.
3:36:413 heures, 36 minutes et 41 secondesOkay. And then taking a look, they just built three different tables. Uh, sessions, trees, and then user stats.
3:36:473 heures, 36 minutes et 47 secondesThe uh database looks more or less like this. So, we have a bunch of ids for all the trees that get made. We have um user stats as well. So, like my level, my XP.
3:36:563 heures, 36 minutes et 56 secondesWe have some session information and uh so on and so forth. And then on the authentication end, um, we have confirm
3:37:053 heures, 37 minutes et 5 secondesemail here, which I'm just going to turn off. And I'm just doing that because it's going to be a lot easier for us.
3:37:093 heures, 37 minutes et 9 secondesUh, and now I'm again just going to test this app end to end. So I think this is local host. Is it 8081?
3:37:163 heures, 37 minutes et 16 secondesProbably. Okay, cool. Cool. And now we have welcome back. Your forest is waiting for you. Um, so this looks pretty cute. I I don't think the seed is good enough. I think what we're realistically going to have to do is
3:37:243 heures, 37 minutes et 24 secondesjust change it. But then again, that's what the testing is for. And then I can sign in. Oh, I haven't actually created an account yet. So, let's just pretend.
3:37:313 heures, 37 minutes et 31 secondesAnd uh okay, it's jumped us directly over to this page. We need the onboarding page. So, I'm going to move back and have it make that change. All right, we had quite a few headaches on
3:37:393 heures, 37 minutes et 39 secondesthat end. Unfortunately, I have yet to fully change all of the um app icons and sprites as well. I realized that some of
3:37:463 heures, 37 minutes et 46 secondesthe app icons I used for this just don't work. And it's not even that they were cut off weirdly. It's just when they were generated um uh sorry, like they
3:37:543 heures, 37 minutes et 54 secondesthey are cut off weirdly. when they were generated, they were generated in this grid pattern and then AI kind of chopped them up. So, what I have to do is I basically have to go to chat GBT and say, "Hey, can you replace these and just generate them one at a time.
3:38:033 heures, 38 minutes et 3 secondesOtherwise, it just takes forever for Cloud to figure out exactly where the bounding boxes are." And honestly, I think GPT image 2, despite me having to spend maybe 10 to 20 cents to get this
3:38:113 heures, 38 minutes et 11 secondesdone, we'll probably just do a better job. Um, and then I can also specify I want you to remove the background and so on and so forth and whatever. So, couple of additional things I'm going to do
3:38:203 heures, 38 minutes et 20 secondesthere, but just because uh I'm about actually to head out to celebrate Mother's Day, I'm going to move forward to the security audit and then finally wrap it up with a final test before I
3:38:283 heures, 38 minutes et 28 secondesdeploy. So, how do I do my security audit? Do you guys remember there is a vibe coding security page right over here. So, I can actually just go copy
3:38:373 heures, 38 minutes et 37 secondesfrom all the way down up to this section, security audit prompt. Now, I'm just going to feed this into AI. Same as usual. So, first thing
3:38:463 heures, 38 minutes et 46 secondesto do is clear. So, actually like clear and get all this all the way up to the very top. And then now when it has zero tokens remaining, I'm just going to
3:38:543 heures, 38 minutes et 54 secondespaste in that security audit. And let's just run through the entire thing end to end. And also, if it's not clear, um, you know, this isn't a process that you're only going to do once. Again,
3:39:023 heures, 39 minutes et 2 secondesyou're ideally going to do this a couple times, maybe two, three times run through. And don't pay attention to that Shaw cancellation message up there. I just had to deal with an internet issue
3:39:113 heures, 39 minutes et 11 secondesquickly because I'm moving places. Boy, were there a lot of problems with that app. Um, I think that this is probably one of the prettier ones that I've
3:39:183 heures, 39 minutes et 18 secondesdesigned and I really like the idea of having AI generate visuals without a background and then modifying those visuals aka uh, you know, in this case having a sprite sort of grow over time.
3:39:283 heures, 39 minutes et 28 secondesThere are some additional things I could have done to optimize the functioning of this particular app. Like for instance, I could have um, I don't know uh, you
3:39:353 heures, 39 minutes et 35 secondesknow, compressed these images so that they load a little faster on mobile.
3:39:383 heures, 39 minutes et 38 secondesThese are things that obviously you can do um, and if you want to do them then you know anytime you have like an app that is imageheavy or anything like
3:39:463 heures, 39 minutes et 46 secondesthat, just add that as sort of a dedicated step before you finish. I should also note you can automate large portions of this whole process as well.
3:39:523 heures, 39 minutes et 52 secondesUh I wanted to do it manually a few times to run you guys through, but for instance, you could just immediately pass this diagram into your cloud
3:40:003 heures et 40 minutesinstance and then uh have it generate like a list of steps, claim, and just have it ask you questions about the app you want to make. Then it could automatically kick off a series of
3:40:083 heures, 40 minutes et 8 secondeschanges that first build it, then find maybe the top three app designs out there and then try and design the app like those apps. Maybe it could automate all of the Chrome testing. Can't really do that on your phone, unfortunately.
3:40:183 heures, 40 minutes et 18 secondesJust kind of how it is. You would still have to manually do those steps. But then you could, I don't know, have it run through the process of creating a Superbase database and, you know, doing
3:40:273 heures, 40 minutes et 27 secondesall that stuff automatically based off of best practices before finally doing that Chrome test again and then employing the security audit. And in fact, that's actually what I uh what
3:40:343 heures, 40 minutes et 34 secondesI've done. I've set up a big claude.mmd file. Again, that is like your system prompt that just contains a bunch of information about my framework and what I like doing. And uh when I actually
3:40:433 heures, 40 minutes et 43 secondescreate an app in my new workspace, the one that uh handles my my new app designs, it's quite straightforward.
3:40:483 heures, 40 minutes et 48 secondesIt's literally like, hey, just ask me all the questions. And then it just asks me a bunch of questions. I answer those questions granularly and then it works together with me to to come up with a
3:40:553 heures, 40 minutes et 55 secondesbig plan before ultimately deploying them. So, pretty cool stuff, eh? You know, I'm just running this another time uh to catch all the security issues that we had the first time and then, you
3:41:043 heures, 41 minutes et 4 secondesknow, see if our solution has caused any additional security issues to crop up.
3:41:093 heures, 41 minutes et 9 secondesNot a very big deal there. And it's looking like a few of these have actually flipped. Um, previously they were fine. And now I think get user versus get session is actually broken.
3:41:183 heures, 41 minutes et 18 secondesSo that's kind of annoying. I'm just going to run through and have it implement the changes just like I did the other time. So great work. run through and implement all changes to
3:41:273 heures, 41 minutes et 27 secondesmove the newly well I'll just say move any yellows or reds to greens pass.
3:41:373 heures, 41 minutes et 37 secondesI'm going to feed that in because I know now that it's done everything and it has now that we're strong. Uh we can basically just do the implementation and then I'll run it through one more time.
Chapitre 34 : Security Audits and Final Touches
3:41:463 heures, 41 minutes et 46 secondesAnd yeah, you can see a bunch of these things were right cuz that's what it did the last time unfortunately. Just going to wait for that to queue and then I'll circle back when it's all ready to go.
3:41:543 heures, 41 minutes et 54 secondesAnd boy is that cool. I just went through a couple of sign up and onboarding flows and I'm just doing it one final run through. But man, the haptic feedback when you hold down on
3:42:023 heures, 42 minutes et 2 secondesthe little seed and then it like jiggles. Uh that's that's really sick.
3:42:053 heures, 42 minutes et 5 secondesAlso, despite the much higher resolution display of uh my phone versus my computer, the pictures look extremely
3:42:123 heures, 42 minutes et 12 secondesclean. And uh yeah, h just happy to say that I mean this is just so much better than anything I I could have imagined. I planted a seed now for the last couple
3:42:203 heures, 42 minutes et 20 secondesof minutes and I got like a cute little sprout going. The first thing in my my forest has been planted. This is one of those apps I could actually very clearly
3:42:283 heures, 42 minutes et 28 secondessee myself using. And what's funny is it's it's very simple. Um, I I find that best apps typically aren't the ones that like pack the most functionality or feature, but they just have, as
3:42:363 heures, 42 minutes et 36 secondesmentioned, a core kind of loop that you just want to return to over and over and over again. You know, in this case, I could either use the timer on my phone.
3:42:433 heures, 42 minutes et 43 secondesAnd don't get me wrong, I could, but why wouldn't I click this button and just see a cute little tree blossom? I have uh accountability. There's there's a
3:42:503 heures, 42 minutes et 50 secondesform of engagement here. I get push notifications saying like, "Hey, your tree is withering. Check in on X, Y, and Z." Uh, so, you know, I think I could
3:42:583 heures, 42 minutes et 58 secondesprobably make this significantly more complex. I could add like crazy progress trackers and stuff like that. But I'm actually totally happy with my little Pomodoro habit tracker. And uh yeah,
3:43:063 heures, 43 minutes et 6 secondeswith all that said, now that I've done this whole build end to end process, I think that I've completed three times now, why don't we actually push
3:43:143 heures, 43 minutes et 14 secondessomething to the app store? And I think because I want this to be uh you know, I want to use like the more complex app, which is probably the calendar AI app.
3:43:223 heures, 43 minutes et 22 secondesSorry, the Cal Tracker or AI app. I'm going to use that as like my push mechanism instead of this. But I want you to know that you can employ the exact same step that I'm about to show
3:43:303 heures, 43 minutes et 30 secondesyou or a series of steps on whatever app you want, whether it's this Pomodoro one, whether it's the habit tracker only built initially, or whether it's something else that you built on your
3:43:383 heures, 43 minutes et 38 secondesend. And it's fairly straightforward. I just got to go run to Mother's Day. And I'll be back after uh giving you guys info about how to set all this stuff up.
3:43:463 heures, 43 minutes et 46 secondesAll right. So, I've actually compiled a full end toend guide in this Google doc right here, which walks you through everything you need to know from the
3:43:543 heures, 43 minutes et 54 secondesmoment that your Expo app is finished, aka, you know, ready to go, all the way up until you have a submitted app on the app store. And so, this is going to be
3:44:023 heures, 44 minutes et 2 secondesthe source dock that I go through as I actually do the app submission. Now, I want you guys to know right off the bat that there's no guarantee that you'll
3:44:103 heures, 44 minutes et 10 secondesactually get your app onto the app store. They have, you know, relatively rigorous lists of rules and procedures.
3:44:163 heures, 44 minutes et 16 secondesAnd you guys will see all the BS that I have to go through actually, you know, putting this app through. I've done it a couple times now, and it just never ceases to amaze me how you need to get
3:44:243 heures, 44 minutes et 24 secondesyour screenshots just right, and you need to have your privacy policies all set up. But whatever, that's just part of the game, right? Um, I want you guys to know we're going to we're going to go
3:44:323 heures, 44 minutes et 32 secondesall the way up until the point that we submit the app. I'm going to show you guys how to do the App Store specifically, and I'm going to show you guys like an alternative that you can use if you want to push it out to the
3:44:403 heures, 44 minutes et 40 secondesPlay Store as well. And you don't need to know a lot of the development stuff that I'm going to be showing you guys.
3:44:453 heures, 44 minutes et 45 secondesYou can also and like what I recommend is take this and feed it through Claude or another AI agent um to have it actually automate a large portion of the procedure for you. So this guide has a
3:44:543 heures, 44 minutes et 54 secondesbunch of prompts and stuff like that that you could use in order to you know test your app. Um let's uh let me run you guys through kind of what the process actually looks like.
Chapitre 35 : Preparing for App Submission
3:45:033 heures, 45 minutes et 3 secondesSo once you're done the expo app and I'm assuming that you've already done, you know, some form of endto-end testing, what we need to do is we need to prepare
3:45:103 heures, 45 minutes et 10 secondesfor production. And so for this example, I'm going to use the calorie tracker app that I developed sort of in the middle of this course. Uh simply because it's a little bit more complicated. There are a
3:45:183 heures, 45 minutes et 18 secondesfew more steps. So when I say prepare for production, I guess what I really mean is we need to make sure that the app is uh ready to go. We have all the
3:45:273 heures, 45 minutes et 27 secondesbells and whistles and all the steps sort of in the right places. And then after we've prepared it for production, we're going to build it. and then we're actually going to push it to, you know,
3:45:343 heures, 45 minutes et 34 secondesApple. So, how do we actually do the preparation for production? Well, basically what we need to do is we need to generate a couple of things. We need
3:45:423 heures, 45 minutes et 42 secondesto generate a few files like app.js n. Now, this just includes a bunch of fields that Apple uses to like, you know, call your app a specific thing.
3:45:523 heures, 45 minutes et 52 secondesSo, think about like the name of your app, for instance. Think about like the identifier. I don't know if you guys have ever been onto the actual app store and seen, but all apps have versions as
3:46:003 heures et 46 minuteswell. Obviously, all apps have have icons of some kind. So, we need to generate this file. We also need to generate this EAS JSON as well, which is
3:46:083 heures, 46 minutes et 8 secondesspecific for Expo. Uh we need to do things like come up with the app icon, you know, the the splash screen. You know, when you push to Android, assume
3:46:163 heures, 46 minutes et 16 secondesyou're also doing that, you need an adaptive icon, which is uh basically some sort of foreground image on a colored background. And I think that's because, you know, dark mode and light
3:46:243 heures, 46 minutes et 24 secondesmode. And so the thing is this this is going to seem pretty complicated and pretty difficult and you're like man I don't know how to do all this stuff. I just want to like develop the app and push it out. But what's really cool is
3:46:333 heures, 46 minutes et 33 secondescloud can actually do all this for you really easily. So all you really have to do is just take this and then go to whatever the workspace is that you have.
3:46:423 heures, 46 minutes et 42 secondesOkay. And then just pump in this app.json and EAS.json. So it's just going to run through a quick configuration. Now I should note that
3:46:493 heures, 46 minutes et 49 secondesI've already actually prepped some of this stuff um ahead of time. Uh, but it's just going to run through and then, you know, go through either create it if it hasn't already been created and then
3:46:583 heures, 46 minutes et 58 secondesjust walk you through the various things that you need to do in order to get it all up and running. So, you can see in my case I I actually have already set the stuff up. I have a pixel width
3:47:063 heures, 47 minutes et 6 secondesof,024 by,024. My image is called public.png. Here's a bunch more data.
3:47:123 heures, 47 minutes et 12 secondesHere's also a bunch of stuff about the app. So, track your calories and macros effortlessly with Cal Tracker. This is all stuff that Claude will put together for you. Basically, there are some
3:47:213 heures, 47 minutes et 21 secondespermissions that you might have to, you know, adjust and kind of add runtime version policies or whatever. And then it'll just go through, it'll apply fixes. Some of the stuff is
3:47:293 heures, 47 minutes et 29 secondesautomatically generated for you as you develop the app. Um, but you should do this final like step basically before you proceed to make sure everything is
3:47:363 heures, 47 minutes et 36 secondes100% good. So, anyway, it's gone through and it's actually fixed all this stuff, you know, with these permissions and stuff like that. Identified that because our app needs, I guess, some audio while
3:47:453 heures, 47 minutes et 45 secondesit's using the camera, we need to put all this stuff in. And uh afterwards it's going to confirm your Apple ID uh assuming that you've already set it up
3:47:523 heures, 47 minutes et 52 secondesand if not we're going to set it up in the in the next section. Once it's prepared what we need to do is we need to actually build for production. And what you need to understand is that apps
3:48:013 heures, 48 minutes et 1 secondesort of exists in a few stages. There's like your local test app which is sort of what we were doing here with Expo where it's running sort of like a live
3:48:093 heures, 48 minutes et 9 secondesdevelopment version for us that we can adjust and tweak in real time. But then when apps actually make it onto like a a real device on the app store, um what
3:48:173 heures, 48 minutes et 17 secondeshappens is we we we take this big amorphous thing that we're constantly editing and changing and we basically make it really concrete. We sort of crystallize the app by building it. And
3:48:263 heures, 48 minutes et 26 secondesbuilding it just like sets a bunch of these parameters uh uh automatically so that it runs a lot faster. And so what we need to do now that we've sort of prepared our app for production is you need to build it for production. Okay.
3:48:353 heures, 48 minutes et 35 secondesAnd the way that you do this, just moving down a little bit, it'll give you a bunch of terminal commands and stuff like that. What I'll do is I'll go back over here and I'll say, "Okay, let's
3:48:453 heures, 48 minutes et 45 secondesbuild it." Now, I'm just going to paste this in. So, it's going to run through this step, see if EAS CLI is already
3:48:523 heures, 48 minutes et 52 secondesinstalled, and then it'll also give you the ability to log into EAS. You might be wondering what EAS is. That's just the Expo system that we've been using up
3:48:593 heures, 48 minutes et 59 secondesuntil now. Okay. So, I'm just going to open up a terminal, and let me just clear all this stuff. Um, now the thing is I'm already in this cal Tracker uh
3:49:073 heures, 49 minutes et 7 secondesdirectory. But if I'm not, say, "Give me command with cd." And what this will do is it'll allow you to open any terminal window and then move to the correct
3:49:153 heures, 49 minutes et 15 secondesdirectory. CD just stands for change directory. Uh if you're not in the directory when you run the command, then there'll be a problem. So I'm just going to assume that I'm not. And then it'll
3:49:223 heures, 49 minutes et 22 secondesask you to log in. So I'm actually already logged in as you know my whatever my account name is. If you're not logged in, um you'll have to run through that login. Again, this is something that you will have already set up at this point in the program. Why?
3:49:323 heures, 49 minutes et 32 secondesbecause you will have already gone to, you know, EAS um and signed up for an Expo account like when we had to do the iPhone mirroring thing. Uh if you're not already signed up, you can do so just by
3:49:413 heures, 49 minutes et 41 secondesheading to expo.dev/signup. Once you're done, just tell it that you are logged in. And uh you can actually go through the process of building the production
3:49:483 heures, 49 minutes et 48 secondesapp. And so I I'm logged in now to my account. And you can see it's now running through like the the portal ID and the build and all this stuff.
3:49:573 heures, 49 minutes et 57 secondesbecause we're doing this for free. They have like a free tier queue which takes a lot longer to build than if you were to like pay for it. Expo is a service
3:50:043 heures, 50 minutes et 4 secondesthat basically just takes all of the work that we've done and then automates the process of, you know, submitting to the app store. Believe it or not, submitting to the app store used to be even more of a pain in the butt before
3:50:133 heures, 50 minutes et 13 secondesExpo came around. Not to mention the testing and so on and so forth. While that's working, uh, make sure you have an Apple developer account set up. So, just head over to developer.apple.com/acount.
3:50:243 heures, 50 minutes et 24 secondesthen also a Google Play uh console developer account. You do that by going to play.google.com/consolezignup.
3:50:323 heures, 50 minutes et 32 secondesBoth of these are everchanging, so I don't really want to, you know, make this video super concrete by walking you through the actual steps, but in general, you're going to need uh you're
3:50:403 heures, 50 minutes et 40 secondesgoing to need a couple of things. Um you're going to need to, you know, make an Apple account unless you already have one. You're going to need to create a profile here. Give it some information
3:50:483 heures, 50 minutes et 48 secondesabout who you are and and what you like and so on and so forth. Um give them their email address. verify your email address and so on and so forth. Uh and
3:50:563 heures, 50 minutes et 56 secondesthen do the same thing here. One little tip I'll give you guys for the Google Play uh console developer account is when you select your organization or
3:51:043 heures, 51 minutes et 4 secondestype um I'd actually make sure that one you have a business email here not just like an an averagegmail.com. You can do
3:51:113 heures, 51 minutes et 11 secondesthat just by setting up like a Google uh workspace account really simply. So I can do that by just moving over to nick at leftclick.ai over here and I can click on my little developer account.
3:51:213 heures, 51 minutes et 21 secondeswhen you do this and you go through the whole sign up, it's just a lot faster because you will have already done a lot of the verification on Google's end, like when you set up the Google
3:51:283 heures, 51 minutes et 28 secondesWorkspace email. Uh, so I mean that, you know, costs six or seven bucks a month to have your little Google Workspace email running, but I'm assuming you guys want to do this as a business. You should probably have a business email,
3:51:373 heures, 51 minutes et 37 secondesyou know, nickleclick.ai, that's the name of my agency, for instance. Once you're done with that, you'll also have to verify you have access to an Android mobile device. They
3:51:453 heures, 51 minutes et 45 secondeswon't actually allow you to do any of this stuff unless you have an Android, which I think kind of makes sense, right? I mean, they're not trying to make money off of you by being like, "Go buy an Android." But you do have to you
3:51:523 heures, 51 minutes et 52 secondesdo have to proceed through the process of like testing it on your Android phone. They want to make sure that whatever app you build is good. Okay.
3:51:583 heures, 51 minutes et 58 secondesSo, anyway, after you're done with all this stuff, the build uh will go through. We'll move on to the next section. So, now we built for production. I'm assuming you guys already have an Apple developer account set up and an App Store Connect sign up.
3:52:093 heures, 52 minutes et 9 secondesUm, now we need to deal with privacy and compliance and then submit the build.
3:52:133 heures, 52 minutes et 13 secondesSo, privacy and compliance is going to vary depending on if you're going through the Apple developer um submission or the App Store submission.
3:52:183 heures, 52 minutes et 18 secondesI want you guys to know that they're very similar. The shapes of them are a little different. Like um you have to do I don't know like they they put all the form fields and stuff like that
3:52:253 heures, 52 minutes et 25 secondesdifferently if it's your Apple developer account uh uh or your app store, but like it's it's all the same thing. You got to come up with screenshots, you know, you got to come up with your
3:52:333 heures, 52 minutes et 33 secondesicons. You got to, you know, come up with a big description of your app. You basically have to optimize your little landing page for the app uh and make sure your app works before you submit
3:52:413 heures, 52 minutes et 41 secondesit. So what I'll do here just to save you guys a bunch of time is I'll just show you a highle overview of uh the Cal Tracker app submission for Apple and
3:52:503 heures, 52 minutes et 50 secondesthen it's a very similar sort of onetoone moveover if you want to do stuff for the for the app store. Now the privacy and compliance is um probably like the the most laborious step here
3:52:583 heures, 52 minutes et 58 secondesbecause in order to set up the privacy and compliance uh these platforms actually force you to have a web accessible landing page set up with like a privacy page and then like a
3:53:063 heures, 53 minutes et 6 secondescompliance kind of like policy. It's a pain in the ass to do. Um, luckily I actually already have one of these for Calracker/privacy.
3:53:143 heures, 53 minutes et 14 secondesAnd this is what mine looks like. So this is my website here, leftclick, right? It's my agency. It's where we build things for companies using um AI technology like this. And the way that
3:53:233 heures, 53 minutes et 23 secondesthat this Cal Tracker privacy policy works is I literally just fed it in the entire page of like the Apple app
3:53:303 heures, 53 minutes et 30 secondessubmission um guidelines and I said, "Hey, I'm coming up with an app called Cal Tracker. Can you create a privacy policy and then host it on, you know, my
3:53:383 heures, 53 minutes et 38 secondesmy website?" And so that's what this whole page is right over here. You can see there's like a way to contact me and stuff like that. There are a couple of
3:53:453 heures, 53 minutes et 45 secondesother pages as well. There's like a support page here um which you'll also have to set up. And you know the reason why I do everything using it is just so
3:53:543 heures, 53 minutes et 54 secondesfast to like create a a web page like this. I literally just said, "Hey, make me a web page. Host it on my website.
3:53:583 heures, 53 minutes et 58 secondesYou're good to go." Right? Like that was like boom. It was 2 seconds. I didn't even have to come up with any of the text. Um I just had to feed it like the the requirement of what was asked. You know, it did things like how accurate
3:54:063 heures, 54 minutes et 6 secondesare the AI nutrition estimates? Well, they're approximate. They should be used as a guide, not the the the end- all beall. How do I set up my enthropic API? Okay. Hey, here's how to do it, right?
3:54:143 heures, 54 minutes et 14 secondesAnd it like sets up the guide and everything. So, I guess what I'm saying is like in order to proceed with the step, you are going to have to have some web accessible resource that ideally is at the same domain as your email.
3:54:223 heures, 54 minutes et 22 secondesDoesn't necessarily have to be, but yeah, I mean, ideally, you would have all that stuff set up. In terms of the actual app page when you actually like go to do the submission, let me show you guys what that looks like. When you're
3:54:313 heures, 54 minutes et 31 secondesdone, what you can do is go to this link. Okay, that'll open up your Expo account. Um, I don't think I actually am signed in right now, which is why I'm
3:54:393 heures, 54 minutes et 39 secondesgetting this page. So, let me just sign in. Then, when you head over to builds, you can actually see it right here. So, iOS App Store build. Okay, give that
3:54:463 heures, 54 minutes et 46 secondesbutton a quick click. And here is basically the whole walkthrough of everything. So, you I mean like this is like the the the finished file basically, which is referred to as a U.
3:54:563 heures, 54 minutes et 56 secondesUm, so with this file here, you could actually go click submit to an app store and then you could run through these submission um steps. I'm going to copy
3:55:033 heures, 55 minutes et 3 secondesthat. Okay, assuming that you have everything set up, all your privacy policies and whatnot. So, what you do is you then type EAS submit platform iOS.
3:55:123 heures, 55 minutes et 12 secondesAnd if you're not already logged in, right, you are going to have to do that login procedure. Um, and if you receive an error saying like, I don't know, your IDs aren't matched up or whatever, just
3:55:213 heures, 55 minutes et 21 secondesPhoebe into Cloud Club can walk you through that process. But after you're done, you just say, "What would you like to submit?" Well, I want to select a build from EAS, which is the service
3:55:293 heures, 55 minutes et 29 secondesthat I just used. So, click that. And you'll see there are a couple of IDs here. Okay, these are all just different apps that I've sort of done. This is 23 hours ago. Yesterday, this is a slightly different ID. So, now I can actually
3:55:373 heures, 55 minutes et 37 secondespress ID. Now, I need to log in to my Apple developer account, which I already created. So, I'll do that now.
3:55:443 heures, 55 minutes et 44 secondesBecause I already have like a key on my computer, it just automated the process of logging in. And now you can actually see the App Store Connects API key and everything. This is basically just
3:55:533 heures, 55 minutes et 53 secondeshooked up to my App Store. And uh at the bottom, I have this big link. So, what I can do is I can open the link. That'll take me back to this page, which is now called an iOS app store submission.
3:56:013 heures, 56 minutes et 1 secondeAgain, this is being managed by Expo. On the lefth hand side here, you can see we have a bunch of different steps. There's builds, there's submissions, there's a couple other things. You can actually do over the air updates through Expo, which
3:56:093 heures, 56 minutes et 9 secondesis pretty cool. Um, but once the actual App Store uh connect is submitted, which will take somewhere between 3 to maybe 5
3:56:183 heures, 56 minutes et 18 secondesminutes or so, there'll be a little link down here that we'll click. It'll actually take us to the submission page.
3:56:223 heures, 56 minutes et 22 secondesThe submission page is going to look something like this. We see up here it says Cal Tracker by Nick. The reason why I have this little logo is that's just what Claude created for me. And I've
3:56:313 heures, 56 minutes et 31 secondesalready done this specific submission just cuz I wanted to save us some time and show you guys how straightforward it is. But basically what you're going to have to do is you're going to have to drag a bunch of screenshots for the 6.5
3:56:393 heures, 56 minutes et 39 secondesin display iPhone right over here. So that's what I did with my app. And I didn't come up with any of this stuff. I just had Claude do it all for me. You'll also need to do the same thing for an
3:56:473 heures, 56 minutes et 47 secondesiPad. And I think what's interesting is the iPad uh like automatically generates a bunch of other variants for you too.
3:56:543 heures, 56 minutes et 54 secondesBut iPhone and iPad, these are kind of annoying to do, of course, but again Claude does it all automatically now.
3:56:583 heures, 56 minutes et 58 secondesIt'll actually open up your your browser, take screenshots. The promotional text over here, I just copy and pasted from clot. Description, just copy and pasted from clot. Keywords.
3:57:083 heures, 57 minutes et 8 secondesHere's the support URL. Okay, so you do need a support URL. Remember what I talked about earlier. That's what I pasted in there. If I copy and paste this in, you'll see I'm on that page.
3:57:163 heures, 57 minutes et 16 secondesYou need a marketing URL, which is just like your homepage for whatever the website is. Not a big deal. Version number should be 1.0. Set your copyright to whatever it is. I mean, in my case,
3:57:243 heures, 57 minutes et 24 secondesit's my company. As you proceed and go down, you'll need to select a build. So I selected just the build that I just submitted to Expo. So uh we need to tie
3:57:333 heures, 57 minutes et 33 secondesthis to a particular build and you know we've submitted the build to the app store. So it's all good. Right over here you need a a required signin. So now
3:57:403 heures, 57 minutes et 40 secondesthis is interesting. It's a login that an actual human reviewer on the app store end will use to sign into your app and test the functionality. So right
3:57:483 heures, 57 minutes et 48 secondesover here we have test e togmail.com t3stx exclamation point.414. That's like the username and the password. And then, you know, I'm saying you can basically
3:57:563 heures, 57 minutes et 56 secondesjust sign up or whatever to do anything you want. And then I always recommend going automatically release this version.
3:58:023 heures, 58 minutes et 2 secondesOkay. Now, unfortunately, this is just one of the many pages here. You actually have a lot to go through. You have the uh app information, which is where you
3:58:103 heures, 58 minutes et 10 secondeschoose the name. So, I just said Cal Tracker by Nick just because, you know, this is a demo and I wanted you guys to see it. After you're done with that, you need to fill out the age ratings, all
3:58:173 heures, 58 minutes et 17 secondesthe content rights, the category, and everything like that. Um, once you're done with that, like I I just proceed top to bottom. You know, you have app reviews. This one's currently waiting
3:58:253 heures, 58 minutes et 25 secondesfor a review of somebody submitted yesterday. And then you can also see the history. U continue proceeding. We have app privacy. So, this is where you add your privacy policy. You can also add a
3:58:333 heures, 58 minutes et 33 secondesuser privacy choices URL. You don't need to do that. It's not required. It's optional. Something's optional. It'll tell you, and I recommend just skipping
3:58:403 heures, 58 minutes et 40 secondesuh product page preview, data types, and then you literally just proceed top to bottom filling out everything that it says that you have to do. And it's
3:58:473 heures, 58 minutes et 47 secondesannoying for sure. Uh if something is optional, it'll specifically tell you.
3:58:513 heures, 58 minutes et 51 secondesIn my case, a lot of the growth and marketing stuff are optional. Uh for pricing, you do have to select a schedule. So that's what I did here. I just made it free. And then there are a
3:58:583 heures, 58 minutes et 58 secondesfew other things you have to do as well, like um if there are any inapp purchases. You need to like be really clear about what they are. Then you also have to make sure that your app is not like gambling. Okay. Anyway, once all
3:59:073 heures, 59 minutes et 7 secondesthat stuff is done, what you do is in the top right hand corner, you'll have a little button that says submit for review. And you can just click that
3:59:153 heures, 59 minutes et 15 secondesbutton and it'll actually be sent to Apple uh to go through that whole process on their end. Okay. So, I've done that now with the Cal Tracker. And as mentioned, there's no way I can
3:59:233 heures, 59 minutes et 23 secondesguarantee that this app actually makes it onto the app store. Obviously, all we can do is we can significantly improve the chances by making sure that we have all the pages and stuff like that. If the review turns out that, you know, our
3:59:313 heures, 59 minutes et 31 secondesapp isn't good. Typically, the reviewers will provide at least some sort of guidance or or steps that you need to take in order to make sure that your app can make it. And it's just up to you how
3:59:383 heures, 59 minutes et 38 secondesdeep uh into it you want to go. What's cool, obviously, is that I have this whole guide here which walks you through it end to end. So if this video ends up insufficient for whatever reason, uh you
3:59:473 heures, 59 minutes et 47 secondescan also just compare this uh and then you know sort of like diagrammatically this is more or less it you just do the same process over and over and over again every single time you want to go
3:59:553 heures, 59 minutes et 55 secondesthrough uh you know an actual submission. And then this post-launch step down here, this is honestly mostly just like your growth and your
4:00:024 heures et 2 secondesmarketing. And um you know earlier on the app store submission page down here where it says uh product page optimization, custom product pages,
4:00:104 heures et 10 secondespromo codes, game center, all this stuff. This is sort of like how you optimize the app once it's launched once you've had a couple of users. I should also note it's kind of weird to just
4:00:184 heures et 18 secondeslike build the app and then launch it and submit it to the app store immediately. Typically, you're going to want to like do some testing. So, um there's a feature here on the App Store
4:00:254 heures et 25 secondesConnect called test flight which allows you before you roll out the app to push this to people uh you know within your network to give them a link that allows
4:00:334 heures et 33 secondesthem to download your app sort of secretly. Uh, typically, you know, you actually do want to push this to a few real users to go through test your app for you, tell you if anything isn't
4:00:414 heures et 41 secondesworking or is kind of janky, but obviously I can't really do that here. I can't go through a big like test feature period for like 2 weeks because I want to publish this video and give you guys
4:00:494 heures et 49 secondesthat value. So, test flight is a is a very viable alternative. Um, and then yeah, make sure that after your test flight kind of distribution, you can
4:00:574 heures et 57 secondesthen do um uh and distribution, you can then do analytics and you can see how things are going and optimize your app.
4:01:034 heures, 1 minute et 3 secondesAnd that's that. Thank you guys very much for joining and completing this journey of mobile app development in cloud code. Had a lot of fun putting it together for you and I absolutely love
4:01:124 heures, 1 minute et 12 secondesdoing end to-end courses like this. So yeah, certainly hoping you learned something. If you guys like these sorts of courses, I also have a seminal 4-hour cloud code course that walks you guys
4:01:204 heures, 1 minute et 20 secondesthrough all the icons and little buttons and widgets, context management, really in-depth prompt engineering, and so on and so forth. So, now that you've sort
4:01:284 heures, 1 minute et 28 secondesof seen a top- down version of how to build things with cloud code, you know, sort of playing around with and learning by doing, if you want a much more bottom
4:01:364 heures, 1 minute et 36 secondesup and comprehensive curriculum, definitely check that out. That'll be down below in the description. I also have a bunch of advanced Claude code courses that teach you things like, you know, how to optimize skills for
4:01:444 heures, 1 minute et 44 secondesknowledge work, um, how to get up and running with like advanced sub agent or multi- aent orchestration and so on and so forth. Now, if you guys have got to
Chapitre 36 : Monetizing Your Skills
4:01:534 heures, 1 minute et 53 secondesthe point where you know how to build stuff, the natural next question is, what do I do with all of my skills? And a route that many people take is monetizing those skills through
4:02:014 heures, 2 minutes et 1 secondeproviding it as a service. And if you guys want to learn how to do that, I also run a community called Maker School that is a 90-day money back guarantee where if you don't get your first client
4:02:094 heures, 2 minutes et 9 secondesby the end of a 90-day period, I will actually give you all of your money back. Has probably the highest completion rates of any online community out there. We've won the school games
4:02:184 heures, 2 minutes et 18 secondesmany times in a row. I was actually the number one community on school for gosh, I don't know, probably three or four months. I went down to Los Angeles, met
4:02:254 heures, 2 minutes et 25 secondeswith Alex Ramoszi and Sam Evans and so on and so forth and actually like taught a bunch of people how to build great high uh engagement, highquality
4:02:334 heures, 2 minutes et 33 secondescommunities where people actually achieve their stated outcomes. So yeah, definitely check that out. Over 2,000 other people are currently learning how to sell these sorts of technologies
4:02:414 heures, 2 minutes et 41 secondesthrough a variety of means. We do lead genen through like cold email. I show you guys how to construct, you know, DM sequences to send to people. I show you
4:02:494 heures, 2 minutes et 49 secondesguys how to build your own social media uh brands and and and and also build like lead generation funnels that don't rely on referrals like I think a lot of people are unfortunately forced to.
4:02:594 heures, 2 minutes et 59 secondesAnyway, I'll stop tooting my own horn, but uh you know, you make it to the end of a 4-hour course, probably going to be at least a couple minutes of advertising. Hopefully you guys appreciated it as mentioned. And if you
4:03:074 heures, 3 minutes et 7 secondesguys have any ideas for future videos, just leave them down below. I'm more than happy to read the comments and then get inspired. I'll see all y'all in the next one. Take care. Oh, and please