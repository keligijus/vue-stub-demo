# vue-stub-demo

## Run Instructions

1. `npm install`
2. `npm run unit`

## Problem

Stub should be called almost on every test. Except only for one wehre `propsData.isEditing` is set to true.
At the moment, it seems that it's only called on the first test (if make any other test to be first, the stub is going to be run on that test only.
It seems that neither callCount nor called are registered on the spy/stub.

## Info

Contains only the testable component. Other have been removed.
