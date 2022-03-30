####What is the difference between Props vs State, when do you use each?

Props is a variable that passed from parent to child component and State is a variable that maintain by it owns component. Basically, Props is used for controlling the child data, so the child can only use the props not modifying it. But if the child has to modified the parent state (a props for child), it should be done by using a Context or Global State (eg. Redux) instead.
