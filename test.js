const beforeVaporize = function () {
    console.log('beforeVaporize :: Before vaporizing checking temperature');
    if (this.data.temperature < 100) {
        throw new Error('beforeVaporize :: You are not hot enough to vaporize');
    }
}

const afterVaporize = function () {
    console.log('afterVaporize :: I am now', this.state);
}

let definition = {
    init: 'solid',
    transitions: [
        { name: 'melt', from: 'solid', to: 'liquid'},
        { name: 'vaporize', from: 'liquid', to: 'gas', before: beforeVaporize, after: afterVaporize },
        { name: 'freeze', from: 'liquid', to: 'solid' },
        { name: 'condense', from: 'gas', to: 'liquid'}
    ],
    data: {
        quantity: '10g',
        temperature: 100
    }
}



// adding history
function StateMachine (definition) {
    this.state = definition.init;
    this.transitions = definition.transitions;
    this.data = definition.data;

    // flags
    this.transitionPending = false;
    
    for (const transition of this.transitions) {
        this[transition.name] = () => {
            return this.fireAction(transition.name);
        }
    }

    this.history = {
        states: [this.state],
        transitions: []
    }
}


// Fire action for transition
StateMachine.prototype.fireAction = function (actionName) {
    let transition = null;
    for (const t of this.transitions) {
        if (t.name === actionName) {
            transition = t;
            break;
        }
    }
    if (this.transitionPending) {
        throw new Error('A transition is already happening');
    }
    this.transitionPending = true;

    // before transition call any hook
    if (transition.before) {
        transition.before.call(this);
    }

    if (this.state !== transition.from) {
        throw new Error(`Transitition '${transition.name}' not allowed from state '${this.state}'`);
    }

    this.state = transition.to;
    console.debug(`Transition complete: '${transition.name}' :: from '${transition.from}' to '${transition.to}'`);

    // after transition call any hook
    if (transition.after) {
        transition.after.call(this);
    }
    
    this.transitionPending = false;

    // track history
    this.history.states.push(this.state);
    this.history.transitions.push(transition.name);
}

//  firining actions
let fsm = new StateMachine(definition);
fsm.melt();
fsm.vaporize();
fsm.condense();
fsm.freeze();

console.log(fsm.history);