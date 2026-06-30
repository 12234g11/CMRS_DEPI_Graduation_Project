import {
  COMPANY_TEAM_AVAILABILITY,
  COMPANY_TEAM_STATUSES,
  companyTeams,
  getCompanyTeamsStats,
} from '../mocks/companyTeamsMockData';

let companyTeamsStore = companyTeams.map((team) => ({ ...team }));

function wait(value, delay = 180) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), delay);
  });
}

function cloneTeam(team) {
  return { ...team };
}

function getStatusMeta(status) {
  if (status === COMPANY_TEAM_STATUSES.DISABLED) {
    return {
      statusLabel: 'موقوفة',
      statusTone: 'danger',
    };
  }

  return {
    statusLabel: 'نشطة',
    statusTone: 'success',
  };
}

function getAvailabilityMeta(availability) {
  if (availability === COMPANY_TEAM_AVAILABILITY.BUSY) {
    return {
      availabilityLabel: 'مشغولة',
      availabilityTone: 'warning',
    };
  }

  if (availability === COMPANY_TEAM_AVAILABILITY.OFFLINE) {
    return {
      availabilityLabel: 'غير متاحة',
      availabilityTone: 'danger',
    };
  }

  return {
    availabilityLabel: 'متاحة',
    availabilityTone: 'success',
  };
}

function normalizeTeamPayload(payload) {
  const status = payload.status || COMPANY_TEAM_STATUSES.ACTIVE;
  const availability = payload.availability || COMPANY_TEAM_AVAILABILITY.AVAILABLE;

  return {
    ...payload,
    membersCount: Number(payload.membersCount || 0),
    activeTasks: Number(payload.activeTasks || 0),
    completedTasks: Number(payload.completedTasks || 0),
    status,
    availability,
    ...getStatusMeta(status),
    ...getAvailabilityMeta(availability),
  };
}

export async function getCompanyTeamsData() {
  const teams = companyTeamsStore.map(cloneTeam);

  return wait({
    teams,
    stats: getCompanyTeamsStats(teams),
  });
}

export async function createCompanyTeam(payload) {
  const normalizedPayload = normalizeTeamPayload(payload);

  const newTeam = {
    id: `team-${Date.now()}`,
    ...normalizedPayload,
    lastActivity: 'تمت الإضافة الآن',
  };

  companyTeamsStore = [newTeam, ...companyTeamsStore];

  return wait({
    team: cloneTeam(newTeam),
    teams: companyTeamsStore.map(cloneTeam),
    stats: getCompanyTeamsStats(companyTeamsStore),
  });
}

export async function updateCompanyTeam(teamId, payload) {
  let updatedTeam = null;

  companyTeamsStore = companyTeamsStore.map((team) => {
    if (String(team.id) !== String(teamId)) return team;

    updatedTeam = {
      ...team,
      ...normalizeTeamPayload({
        ...team,
        ...payload,
      }),
      lastActivity: 'تم التحديث الآن',
    };

    return updatedTeam;
  });

  return wait({
    team: cloneTeam(updatedTeam),
    teams: companyTeamsStore.map(cloneTeam),
    stats: getCompanyTeamsStats(companyTeamsStore),
  });
}

export async function updateCompanyTeamStatus(teamId, nextStatus) {
  let updatedTeam = null;

  companyTeamsStore = companyTeamsStore.map((team) => {
    if (String(team.id) !== String(teamId)) return team;

    const nextAvailability =
      nextStatus === COMPANY_TEAM_STATUSES.DISABLED
        ? COMPANY_TEAM_AVAILABILITY.OFFLINE
        : team.availability === COMPANY_TEAM_AVAILABILITY.OFFLINE
          ? COMPANY_TEAM_AVAILABILITY.AVAILABLE
          : team.availability;

    updatedTeam = {
      ...team,
      status: nextStatus,
      availability: nextAvailability,
      ...getStatusMeta(nextStatus),
      ...getAvailabilityMeta(nextAvailability),
      lastActivity: 'تم تحديث الحالة الآن',
    };

    return updatedTeam;
  });

  return wait({
    team: cloneTeam(updatedTeam),
    teams: companyTeamsStore.map(cloneTeam),
    stats: getCompanyTeamsStats(companyTeamsStore),
  });
}