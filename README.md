# Beity 🏠

For all your home management needs, well... to an extent!
Offers the following (for now):

- Shopping List, Git-Styled with uncommitted changes (local) and a centralized online list!
- Routine Job Management, check when the last time a task was performed at the house, and by who.
- Meal Concillation, ever wondered what people in the household wanna eat? Well I'm tired of asking my brother everyday so I made this.

## Can I run it for my own house?

Yes, but you'll need a centralized data source. Currently, Beity supported a simple github repository out of the box.
In order to hook up a github repository, just following the following steps:

- Create a github repository (preferably with public access, a private one has limitations) on your account or a "spare" account.
- Create an access key for your repository (needed to actually call the API and make updates programatically to your data source).
- Clone the repository, or download it (or don't 😡)
- Create a .env file in the base directory (where package.json is).
- Paste and populate the following environment variables:
