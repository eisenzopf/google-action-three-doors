---
title: Building your first Action for Google Home (in 30 minutes)
---

 

Developing Actions on Google Series Overview
============================================

This is the first in a series of articles that I’ll be writing where we will
learn how to develop and deploy actions on Google. Actions can currently be used
on Google Home devices or in the Google Assistant app on Google Pixel phones.

 

In this first article, the goal is to get you up and running in as little time
as possible so that you can run your Action in test mode. In future articles, we
will dive deeper into the code, learn how to test and deploy your action, and
use other tools like API.ai. If you have any problems, reach out to me
[\@eisenzopf](https://twitter.com/eisenzopf) on twitter. For now, time is
ticking so let’s get started.

>   Note: We will be using the `gaction` command line interface (CLI) throughout
>   this article, because it’s faster and scriptable. Every action in this
>   article using the CLI has a corresponding equivalent from the Google
>   Console.

 

Pre-requisites
==============

First, I’m assuming that you have some basic technical skills and can work
around Linux or OS X.

To make this work, all you’ll need is:

-   A Google Home device

-   Linux/Unix/OS X with Bash, curl, Node.js, git, and npm (bundled with
    Node.js)

-   Python 2.7 or Later

-   Java 1.7 or later

-   a Google Gmail account (recommended but not required if you want the web
    simulator to work)

 

>   If you don’t have a Google Home device and/or Node.js, see the Reference
>   section below. If you are running Windows 10, see the reference section
>   below for installing Bash and curl on your system. Note for Windows 10
>   users: remove the `sudo` anytime you see it in this tutorial as it is not
>   needed.

 

>   Note: Once you finish this article, your first stop should be the [Design
>   Checklist](https://developers.google.com/actions/design/checklist) by my
>   good friend Nandini Stocker, one of the best voice user interface (VUI)
>   designers in the business. You must follow the design guidelines in order
>   for your Google Action to be approved. We will talk more about deploying
>   your application in a future article.

 

How Google Actions work
=======================

Without getting too detailed, the way a Google Home device works is that it
captures your voice intent on the Google Action Platform and translates this to
text.

![alt tag](./conversation-api.png)

1.  The Google Action Platform attempts to match the Intent to an Action in the
    directory and then to an Action endpoint. As a developer, when you’re ready
    to deploy an action, there is a Google registration process where you
    register your action intent name, like **Three Doors**. The Google Action
    Platform then know what Action to send the request to. Once registered, the
    Google Action Platform makes requests to your server side application via an
    HTTP POST request and sends the user’s input via a JSON document.

2.  Your application decodes the user’s inputs in a Node.js or other server side
    application, and sends back a JSON response, which will play content back to
    the user or ask for input. In the case above, we’re prompting the user to
    pick a door.

3.  The users says **three** which is sent to Google, translated to text, and
    sent on to the server side application, which takes the input and responds
    with another JSON document, which could be the next selection or end the
    dialog.

 

Create a directory for your code
================================

It doesn’t really matter where you put it and I know it’s obvious, but start by
creating a new directory for our code:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
mkdir three-doors
cd three-doors
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

Clone three-doors from GitHub
=============================

Now you can clone the code for this tutorial from GitHub:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
git clone https://github.com/eisenzopf/google-action-three-doors.git
cd google-action-three-doors
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The key source code files are:

action.json.bak

index.js

json/

package.json

 

Install Node.js packages
========================

Next run:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
npm install
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This should install all of the Node.js package dependencies that you need for
the project.

 

Setting up your Google Action Skill
===================================

Now that we have an application environment setup, we can setup our environment
for creating a Google skill.

 

Google cloud setup
------------------

If you already have a Google cloud account with billing setup, you can skip this
step. Otherwise, you will need to visit <https://cloud.google.com/> and create a
new account. You can set up a trial account for free and at the time of this
writing, Google is offering a \$300 credit that can be used over 12 months.
Simple.

Once you go through the setup, the system will drop you into the [Google Cloud
Console](https://console.cloud.google.com/).

 

Install the gcloud CLI and create a new Google Action project
-------------------------------------------------------------

Now that you have a Google Cloud account, we are going to install the Google
Cloud CLI called `gcloud` on our local machine and use it to create a new Google
Action project.

 

**1.** To install the gcloud CLI, we must first install the Google Cloud SDK.
There are several different installation options, which are all documented at
<https://cloud.google.com/sdk/downloads>. The easiest way is to run the
following commands:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
curl https://sdk.cloud.google.com | bash
exec -l $SHELL
gcloud init
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You will be asked a number of questions that are straightforward and once done,
the `gcloud` will be ready to go.

 

**2.** Now we will create a new Google Action project using the `gcloud` CLI
from a terminal window from within your project directory. Run:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gcloud alpha projects create three-doors-xxxx
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Note: Replace `xxxx` with four random numbers of your choosing.

This will create a new project within your Google Cloud account. This is an
alpha command and may change. You can alternatively create a new project in the
[Google Cloud Console GUI](https://console.cloud.google.com).

 

**3.** To confirm the project was created, run:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gcloud projects list
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You should see your newly created project on the list in addition to a default
project that was created when you ran `cloud init` command.

 

**4.** Change current project to the created project by running:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gcloud config set project three-doors-xxxx
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Note: Replace `xxxx` with the four numbers you chose above.

 

**5.** Set billing for the project. Make sure that a billing account is
associated with the project by visiting

`https://console.developers.google.com/project/three-doors-xxxx/settings` where
xxxx is the 4 numbers you chose when creating the project.

 

**6.** Lastly, we need to add the Google Action API to the project. This can be
done from the Google Cloud Platform Console at
<https://console.cloud.google.com>.

-   From the console, at the very top left of the page to the right of the
    Google Cloud Platform logo, you will see two drop-down menus. Click on the
    second one that may say *My First Project*

-   Select the option labeled **View more projects**.

-   Select the project you just created from the `gcloud` CLI (three-doors-xxxx)
    and click on the **OPEN** button.

-   In the middle of the page click on the link labeled **Go to APIs overview**.

-   This page shows you which Google APIs have been enabled, but we need to add
    one so click the **+ENABLE API** link near the top middle of the page.

-   In the search box, type *Action* and you should see **Google Actions API**.
    Click on it.

-   At the top middle of the new page, click **ENABLE**.

-   Go back to the search box and type *Function* and you should see **Google
    Cloud Functions API**. Click on it.

-   At the top middle of the new page, click **ENABLE**.

The Google Actions API and Functions API are now enabled for your new project in
the Google Cloud environment.

 

**7.** Create a Google Cloud Storage Bucket to store your Google Functions

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gsutil mb gs://three-doors-xxxx
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Note: Replace `xxxx` with the four numbers you chose above.

This will provision a new Storage Bucket to host your code on the Google Cloud.
You should be able to see the newly created bucket by running the command
`gsutil ls`

 

Install and initialize gaction CLI
----------------------------------

Now its time to get `gaction` environment set up. This is a command line tool
you’ll run from a terminal that deploys your `action.json` file. This is the
file that, once published and approved by Google, enables **Google Assistant**
enabled devices such as **Google Home** or **Allo** on Android or iOS to access
your **Google Action** application.

 

**1.** First point your browser to
<https://developers.google.com/actions/tools/gactions-cli> and download the
gactions command-line tool.

>   Shortcut from a terminal window, in your project directory, you can download
>   directly using `curl`.

>   On Linux:

>   `curl -O
>   https://dl.google.com/gactions/updates/bin/linux/amd64/gactions/gactions`

>   On Mac OS X:

>   `curl -O
>   https://dl.google.com/gactions/updates/bin/darwin/amd64/gactions/gactions`

 

**2.** Next change permissions for gactions to executable:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
chmod +x gactions
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

 

**3.** Within your project directory, initialize the tool inside a terminal
window:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
./gactions init
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This will create a default `action.json` file in your project directory. Now we
need to edit it.

 

Edit the action.json
--------------------

1.  Open `action.json` in your favorite editor. We’re going to break this into
    two parts: the **header** and **actions**. For each named value in the left
    column, replace it with the values in the right column. These first two
    attributes are at the top of the file:

| `versionLabel` | 1.0                                                                                                 |
|----------------|-----------------------------------------------------------------------------------------------------|
| `projectId`    | three-doors-xxxx (replace with the project id you used when creating the project with `gcloud` CLI) |

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
{
  "versionLabel": "1.0",
  "agentInfo": {
    "languageCode": "en-US",
    "projectId": "three-doors-xxxx",
    "voiceName": "male_1"
  },
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

When edited, it should look something like the above.

 

1.  Next we’re going to edit **actions** section of the `action.json` file,
    which contains the list of possible thinks that the application will
    recognize. Every Google Assistant `action.json` will have an
    `initialTrigger` section. This is the action that will always be called
    first, so it’s also the most important one to get correct.

In this initial `action.json` file that was created with the `actions init`
command, there are two `initialTrigger` sections. That is because an application
can be called in multiple ways. We’re not going to worry about that in our first
application so delete the second `initialTrigger` section.

The `actions` portion of our `action.json` file should now look similar to the
following:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
  "actions": [
    {
      "description": "Launch intent",
      "initialTrigger": {
        "intent": "assistant.intent.action.MAIN"
      },
      "httpExecution": {
        "url": "https://us-central1-three-doors-xxxx.cloudfunctions.net/three_doors"
      }
    }
  ]
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Note: Replace `xxxx` with the four numbers you chose above.

 

Deploy your application to Google App Engine
--------------------------------------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
gcloud beta functions deploy three_doors --trigger-http --stage-bucket gs://three-doors-xxxx
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

>   Note: Replace `xxxx` with the four numbers you chose above.

This will deploy your Google Function, which is contained in the `index.js`
source file (we’ll talk about that next time), into the Google Cloud. If this is
the first time you’ve deployed the application, it will take some time; as much
as 5 minutes. Don’t worry, updates don’t take nearly as long so it’s worth the
wait of not having to manage your own servers.

 

Deploy your action.json test file
---------------------------------

Next, it’s time to use the command-line or web simulator to test your new Action
on Google. Use the command below. If this is the first time running the command,
you may see instructions to enter a security token, so be sure to read and
follow the instructions.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
./gactions preview --action_package action.json --invocation_name "three doors" --preview_mins 1234
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Running the `gactions` command above will temporarily turn on your new Action of
Google temporarily. Only you will be able to test it. This allows you to test
the application in the command-line or web simulator or on your Google Home
device. The google email you used to set up your cloud project will need to be
the same account that manages your Google Home device.

 

Test your action
----------------

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
./gactions simulate
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

You may also be instructed to turn on audio in your Google account; if you do,
just follow the instructions.

 

In the simulator, type:

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
talk to three doors
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

This should start the dialog.

When you run the command, there is also an option to start a web based simulator
that will play the audio.

 

Congratulations!
================

You just set up and deployed your first Action on Google. I’ve included a list
of references below. In the next article in the series, we will look at the code
and understand more how it works.

 

Please share this article if you found it useful or message me on twitter
\@eisenzopf

 

References
==========

-   [Installing Node.js](https://nodejs.org/en/download/package-manager/)

-   [Using the Google Action
    Simulator](https://developers.google.com/actions/tools/testing)

-   [Design Checklist by Nandini
    Stocker](https://developers.google.com/actions/design/checklist)

-   [Installing bash on Windows
    10](http://www.windowscentral.com/how-install-bash-shell-command-line-windows-10)
    or alternatively [Installing Cygwin](https://cygwin.com/install.html) which
    I personally prefer

-   [Installing curl on Windows 10](https://curl.haxx.se/download.html)

-   [Creating a Google Action
    Package](https://developers.google.com/actions/develop/sdk/actions#creating_an_action_package)

-   [Google API
    Manager](https://console.developers.google.com/projectselector/apis/api/actions.googleapis.com/overview)

-   [Google API Dashboard](https://console.developers.google.com/apis/dashboard)

-   [Deploying a Google
    Action](https://developers.google.com/actions/distribute/deploy)

-   [Getting Starting with the Google Action
    SDK](https://developers.google.com/actions/develop/sdk/getting-started)

-   [Google Action Conversation JSON
    API](https://developers.google.com/actions/reference/conversation)

-   [Deploying Google Actions to App
    Engine](https://developers.google.com/actions/samples/)

-   [Writing Google Cloud HTTP
    Functions](https://cloud.google.com/functions/docs/writing/http)

-   [RegExr.com Regex](http://regexr.com/3fjd6)
