function StateMachine (definition) {
    this.state = definition.init;
    this.transitions = definition.transitions;
    this.data = definition.data;

    this.history = {
        states: [this.state],
        transitions: []
    }

    // flags
    this.transitionPending = false;
    
    for (const transition of this.transitions) {
        this[transition.name] = () => {
            return this.fireAction(transition.name);
        }
    }
}

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

    //TODO: before transition
    if (transition.before) {
        transition.before.call(this);
    }

    if (this.state !== transition.from) {
        throw new Error(`Transitition '${transition.name}' not allowed from state '${this.state}'`);
    }

    this.state = transition.to;
    console.debug(`Transition complete: '${transition.name}' :: from '${transition.from}' to '${transition.to}'`);

    if (transition.after) {
        transition.after.call(this);
    }
    
    this.transitionPending = false;
    this.history.states.push(this.state);
    this.history.transitions.push(transition.name);
}

const beforeMelt = function () {
    console.log('Before melting checking temperature');
}

const beforeVaporize = function () {
    if (this.data.temperature < 100) {
        throw new Error('You are not hot enough to vaporize');
    }
    console.log('Before vaporizing checking temperature');
}

const afterMelt = function () {
    console.log('Is my volume still the same after I became', this.state);
}

const definition = {
    init: 'solid',
    transitions: [
        { name: 'melt', from: 'solid', to: 'liquid', before: beforeMelt, after: afterMelt },
        { name: 'vaporize', from: 'liquid', to: 'gas', before: beforeVaporize },
        { name: 'freeze', from: 'liquid', to: 'solid' },
        { name: 'condense', from: 'gas', to: 'liquid'}
    ],
    data: {
        quantity: '10g',
        temperature: 100
    }
}
const fsm = new StateMachine(definition);

fsm.melt();
fsm.vaporize();
fsm.condense();
fsm.freeze();

console.log(fsm.history);
// fsm.fireAction('melt'); // now liquid
// fsm.fireAction('vaporize'); // now gas
// fsm.fireAction('condense'); // now liquid
// fsm.fireAction('freeze'); // now solid


//