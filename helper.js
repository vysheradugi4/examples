'use strict';

const mongoose = require('mongoose');
const EmrProvider = mongoose.model('EmrProvider');
const EmrLocation = mongoose.model('EmrLocation');
const EmrService = mongoose.model('EmrService');
const EmrProcedure = mongoose.model('EmrProcedure');
const EmrInsurance = mongoose.model('EmrInsurance');
const EmrRoom = mongoose.model('EmrRoom');
const EmrDepartment = mongoose.model('EmrDepartment');
/**
 * Update data for current practice and set for it emr insurance.
 * @param  {String} practiceId Practice id.
 * @param  {String} externalId Id of remote procedure in other system.
 * @param  {String} insurance  Id of ensurance.
 * @return {Promise} Promise object represents status of updated data.
 */
function updateEmrInsuranceByPractice(practiceId, externalId, insurance) {
  return EmrInsurance.update(
    { practice: practiceId, insurance },
    { $unset: { insurance: '' } },
    { multi: true }
  ). then(() => {
    return EmrInsurance.update(
      { practice: practiceId, externalId },
      { $set: { insurance } }
    );
  });
}

/**
 * Return updated  current type emr mapping.
 * @param  {String} practiceId   Unique practice id.
 * @param  {String} emrMappingId Unique emr mapping id.
 * @param  {String} type         Type of emr mappings.
 * @param  {Object} model        Contains fields for update.
 * @return {Promise}             Promise object represents updated emr mapping
 * object.
 */
function editEmrMappingByPractice(practiceId, emrMappingId, type, model) {
  // Сheck that the correct type has come. EMR_MAPPING_TYPE has all correct types.
  // Search into EMR_MAPPING_TYPE key and value, e.g. insurance: 'insurance'.
  if (!EMR_MAPPING_TYPE.hasOwnProperty(type) || EMR_MAPPING_TYPE[type] !== type) {
    throw boom.badRequest(ERRORS.EMR_MAPPING_TYPE_NOT_FOUND);
  }
  if (!practiceId) throw boom.notFound(ERRORS.BUSINESS_NOT_FOUND);
  if (!emrMappingId) throw boom.notFound(ERRORS.EMR_MAPPING_NOT_FOUND);
  if (_.isEmpty(model)) throw boom.badRequest(ERRORS.EMPTY_EMR_MAPPING_MODEL);

  let query = {
    practice: practiceId,
    _id: emrMappingId
  };

  // Update element in model by type.
  // Forming model name from Emr and type with first uppercase char. Like EmrInsurance
  return mongoose.model(`Emr${ _.upperFirst(type) }`)
    .findOneAndUpdate(
      query,
      { $set: model },
      { new: true }
    );
}

function getEmrRoomsByPractice(practiceId) {
  return EmrRoom.find({ practice: practiceId });
}
function getEmrDepartmentsByPractice(practiceId) {
  return EmrDepartment.find({ practice: practiceId });
}

/**
 * Update emr rooms. Unset old, set new association with room. Return status of
 * updated.
 * @param  {String} practiceId Practice id.
 * @param  {String} externalId External id.
 * @param  {String} room       Room id.
 * @return {Promise}           Promise object represents status of updated.
 */
function updateEmrRoomsByPractice(practiceId, externalId, room) {
  return EmrRoom.update(
    { practice: practiceId, room },
    { $unset: { room: '' } },
    { multi: true }
  ). then(() => {
    return EmrRoom.update(
      { practice: practiceId, externalId },
      { $set: { room } }
    );
  });
}

/**
 * Unset old emr department, set new emr department. Return status.
 * @param  {String} practiceId Practice id.
 * @param  {String} externalId External id.
 * @param  {String} department Department id.
 * @return {Promise}           Promise object represents status of updated.
 */
function updateEmrDepartmentsByPractice(practiceId, externalId, department) {
  return EmrDepartment.update(
    { practice: practiceId, department },
    { $unset: { department: '' } },
    { multi: true }
  ). then(() => {
    return EmrDepartment.update(
      { practice: practiceId, externalId },
      { $set: { department } }
    );
  });
}

/**
 * Create new mapping, return it.
 * @param  {String} practiceId Practice id.
 * @param  {Object} mapping  Data of new mapping.
 * @return {Promise} Promise object represents new created mapping.
 */
function createEmrMappingByPractice(practiceId, mapping) {
  switch (mapping.type) {
    case EMR_MAPPING_TYPE.provider: {
      const emrProvider = new EmrProvider({
        firstName: mapping.firstName,
        lastName: mapping.lastName,
        externalId: mapping.externalId,
        practice: practiceId,
      });

      return emrProvider.save();
    }

    case EMR_MAPPING_TYPE.location: {
      const emrLocation = new EmrLocation({
        address: mapping.address,
        externalId: mapping.externalId,
        practice: practiceId
      });

      return emrLocation.save();
    }

    case EMR_MAPPING_TYPE.service: {
      const emrService = new EmrService({
        title: mapping.title,
        description: mapping.description,
        externalId: mapping.externalId,
        practice: practiceId,
        service: mapping.id
      });

      return emrService.save();
    }

    case EMR_MAPPING_TYPE.room: {
      const emrRoom = new EmrRoom({
        name: mapping.name,
        externalId: mapping.externalId,
        practice: practiceId,
        room: mapping.id
      });

      return emrRoom.save();
    }

    case EMR_MAPPING_TYPE.department: {
      const emrDepartment = new EmrDepartment({
        name: mapping.name,
        externalId: mapping.externalId,
        practice: practiceId,
        department: mapping.id
      });

      return emrDepartment.save();
    }

    case EMR_MAPPING_TYPE.procedure: {
      const emrProcedure = new EmrProcedure({
        title: mapping.title,
        externalId: mapping.externalId,
        procedure: mapping.id,
        practice: practiceId
      });

      return emrProcedure.save();
    }

    case EMR_MAPPING_TYPE.insurance: {
      const emrInsurance = new EmrInsurance({
        title: mapping.title,
        externalId: mapping.externalId,
        insurance: mapping.id,
        practice: practiceId
      });

      return emrInsurance.save();
    }
    default:
  }
}
