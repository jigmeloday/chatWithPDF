[Branching Diagram](https://app.diagrams.net/#G1M2D-E3kYp3eJ8nh9VBtSrSacnBPrBrdm)
#
[FEATURE](https://docs.google.com/document/d/1yl9_YcareOgYXOy1AfCAiB1tejD6-XeAJ9LHVjZfQ7Y/edit)
#
### Hi,
this is Know Me app. I made this app to learn Ruby on Rail with React ts. For now 
this app is mainly for showing our skills after login or sign up.

***

## Setting up development environment
Run the following commands on repo root
> _yarn install_


## Running Apps

> _yarn start_

## Building


> _yarn nx build_



### Branching Guide
In a Monorepo, it becomes necessary to have some pattern to name your branches, as to add meaning to the PRs that are created.


**For FE**

_`rw/fe/[feat|fix|hotfix|release|chore|refactor]/<feature_name>`_

> e.g.  rw/fe/feat/feature-name

**For UI**

_`rw/ui/[feat|fix|hotfix|release|chore|refactor]/<feature_name>`_

> e.g. rw/ui/feat/feature-name


### Folder Structure for components

All concerns related to a component must be grouped inside their respective folders nested inside components directory

Concerns:
* component
* styles
* specs

`apps/<app-name>/**/components/<component-name.tsx>`

`apps/<app-name>/**/components/<component-name.styles.tsx>`

`apps/<app-name>/**/components/<component-name.spec.tsx>`
