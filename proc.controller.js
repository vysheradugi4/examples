angular.module('settings.emr-mappings')
  .controller('EmrMappingsController', EmrMappingsController);

EmrMappingsController.$inject = [
  'PracticeService',
  'dialogService',

  'EMR_MAPPING_TYPE'
];

function EmrMappingsController(
  PracticeService,
  dialogService,

  EMR_MAPPING_TYPE
) {
  let vm = this;

  vm.addMappingForProcedure = addMappingForProcedure;
  vm.editMappingForProcedure = editMappingForProcedure;
  vm.updateEmrProcedure = updateEmrProcedure;

  init();

  function init() {
    getEmrProcedures();
  }

/**
 * Get all emr procedures for the current practice.
 */
function getEmrProcedures() {
  if (!vm.practice._id) return false;

  PracticeService
    .getEmrProceduresByPractice(vm.practice._id)
    .then(emrProcedures => {
      vm.emrProcedures = emrProcedures;
      vm.procedures = _.map(vm.procedures, procedure => {
        procedure.updating = true;
        delete procedure.emrProcedure;
        let emrProcedure = _.find(vm.emrProcedures, {
          procedure: procedure._id
        });
        if (emrProcedure) {
          $timeout(() => {
            _.assignIn(procedure, {
              emrProcedure: emrProcedure._id
            });
          });
        }
        procedure.updating = false;
        return procedure;
      });
    });
}

/**
 * Add new mapping to procedure.
 * @param {String} procedureId Unique procedure id.
 */
function addMappingForProcedure(procedureId) {
  if (!procedureId) return false;

  const model = {
    title: '',
    externalId: ''
  };

  dialogService.addEmrMapping(EMR_MAPPING_TYPE.procedure, procedureId, model)
    .then((mapping) => {
      vm.emrProcedures.push(mapping);

      // Find procedure.
      let procedure = _.find(vm.procedures, {
        _id: procedureId
      });
      procedure.emrProcedure = mapping._id;

      vm.updateEmrProcedure(procedure);
    });
}

/**
 * Edit emr mapping. Can edit title, external id.
 * @param  {String} emrProcedureId Unique id of emr procedure.
 */
function editMappingForProcedure(emrProcedureId) {
  if (!emrProcedureId) return false;

  let emrProcedure = _.find(vm.emrProcedures, { _id: emrProcedureId });
  if (!emrProcedure) return false;

  const editFields = ['title', 'externalId'];

  dialogService.editEmrMapping(EMR_MAPPING_TYPE.procedure, emrProcedure, editFields)
    .then(result => {
      // Find edited object and replace new fileds on it.
      _.assignIn(_.find(vm.emrProcedures, {
        _id: result._id
      }), result);
    })
    .catch(err => {
      if (err) {
        let procedure = _.find(vm.procedures, { emrProcedure: emrProcedure._id });
        procedure.errorMessage = _.get(err, 'data.message') || err.message;
      }
    });
}

/**
 * Handler for select. Updating link of procedure and emr mapping.
 * @param  {Object} procedure Object represents procedure.
 */
function updateEmrProcedure(procedure) {
  if (procedure.updating) return false;
  procedure.updating = true;

  // For get externalId
  let emrProcedure = _.find(vm.emrProcedures, { _id: procedure.emrProcedure });

  return PracticeService.updateEmrProcedure(vm.practice._id, _.get(emrProcedure, 'externalId'), procedure._id)
    .catch(err => {
      procedure.errorMessage = _.get(err, 'data.message') || err.message;
      return err;
    })
    .finally(() => {
      getEmrProcedures();
      procedure.updating = false;
    });
}
