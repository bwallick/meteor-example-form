import { _ } from 'meteor/underscore';
import { ReactiveVar } from 'meteor/reactive-var';
import { Template } from 'meteor/templating';

/**
 * Return the data from the submitted form corresponding to the fields in the passed schema.
 * @param schema The simple schema.
 * @param event The event holding the form data.
 * @returns {Object} An object whose keys are the schema keys and whose values are the corresponding form values.
 */

export function getSchemaDataFromEvent(schema, event) {
  const eventData = {};
  _.map(schema._firstLevelSchemaKeys, function (key) {
    if (schema._schema[key].type.name === 'Array') {
      const selectedValues = _.filter(event.target[key].selectedOptions, (option) => option.selected);
      eventData[key] = _.map(selectedValues, (option) => option.value);
    } else {
      eventData[key] = event.target[key].value;
    }
  });
  return eventData;
}

/* eslint-disable no-param-reassign */

/**
 * Rename oldKey in obj to newKey.
 * @param obj The object containing oldKey
 * @param oldKey The oldKey (a string).
 * @param newKey The newKey (a string).
 */
export function renameKey(obj, oldKey, newKey) {
  obj[newKey] = obj[oldKey];
  delete obj[oldKey];
}

/**
 * Add successClass, errorClass, and context to the template.
 * @param instance The template instance.
 * @param schema The schema associated with the form in this instance.
 */
export function setupFormWidget(instance, schema) {
  instance.successClass = new ReactiveVar('');
  instance.errorClass = new ReactiveVar('');
  instance.context = schema.namedContext('widget');
  // do this just in case the schema has a slug. Not always needed but does no harm.
  schema.messages({ duplicateSlug: 'The slug [value] is already defined.' });
}

/**
 * After a form submission has completed successfully, update template state to indicate success.
 * @param instance The template instance.
 * @param event The event holding the form data.
 */
export function indicateSuccess(instance, event) {
  instance.successClass.set('success');
  instance.errorClass.set('');
  event.target.reset();
  instance.$('.dropdown').dropdown('clear');
}

/**
 * If a form submission was not validated, update template state to indicate error.
 * @param instance The template instance.
 */
export function indicateError(instance) {
  instance.successClass.set('');
  instance.errorClass.set('error');
}

export function processCancelButtonClick(event, instance) {
  event.preventDefault();
  instance.data.updateID.set('');
}

export function processUpdateButtonClick(event, instance) {
  event.preventDefault();
  const id = event.target.value;
  instance.data.updateID.set(id);
}

/*
 * Register common helper classes for form processing.
 */
Template.registerHelper('successClass', () => Template.instance().successClass.get());
Template.registerHelper('errorClass', () => Template.instance().errorClass.get());
Template.registerHelper('fieldError', (fieldName) => {
  const invalidKeys = Template.instance().context.invalidKeys();
  const errorObject = _.find(invalidKeys, (keyObj) => keyObj.name === fieldName);
  return errorObject && Template.instance().context.keyErrorMessage(errorObject.name);
});
