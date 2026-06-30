import {
    FiEdit3,
    FiEye,
    FiPhone,
    FiPower,
    FiToggleLeft,
    FiUsers,
} from 'react-icons/fi';
import { COMPANY_TEAM_STATUSES } from '../mocks/companyTeamsMockData';

function CompanyTeamsTable({
    teams = [],
    onViewTeam,
    onEditTeam,
    onChangeStatus,
}) {
    return (
        <div className="company-teams-table-wrap">
            <table className="company-teams-table">
                <thead>
                    <tr>
                        <th>اسم الفرقة</th>
                        <th>قائد الفرقة</th>
                        <th>التواصل</th>
                        <th>الأفراد</th>
                        <th>المهام النشطة</th>
                        <th>المهام المكتملة</th>
                        <th>التوفر</th>
                        <th>الحالة</th>
                        <th>آخر تحديث</th>
                        <th>الإجراء</th>
                    </tr>
                </thead>

                <tbody>
                    {teams.map((team) => (
                        <tr key={team.id}>
                            <td>
                                <strong>{team.name}</strong>
                                <span>{team.id}</span>
                            </td>

                            <td>{team.leadName}</td>

                            <td>
                                <span className="company-team-phone">
                                    <FiPhone />
                                    <bdi dir="ltr">{team.phone}</bdi>
                                </span>
                            </td>

                            <td>
                                <span className="company-team-members-pill">
                                    <FiUsers />
                                    {team.membersCount} أفراد
                                </span>
                            </td>

                            <td>{team.activeTasks}</td>

                            <td>{team.completedTasks}</td>

                            <td>
                                <span className={`company-team-availability company-team-availability--${team.availabilityTone}`}>
                                    {team.availabilityLabel}
                                </span>
                            </td>

                            <td>
                                <span className={`company-team-status company-team-status--${team.statusTone}`}>
                                    {team.statusLabel}
                                </span>
                            </td>

                            <td>{team.lastActivity}</td>

                            <td>
                                <div className="company-team-actions">
                                    <button
                                        type="button"
                                        className="company-team-view-btn"
                                        onClick={() => onViewTeam(team)}
                                    >
                                        عرض
                                    </button>

                                    <button
                                        type="button"
                                        className="company-team-edit-btn"
                                        onClick={() => onEditTeam(team)}
                                    >
                                        تعديل
                                    </button>

                                    <button
                                        type="button"
                                        className={
                                            team.status === COMPANY_TEAM_STATUSES.ACTIVE
                                                ? 'company-team-disable-btn'
                                                : 'company-team-enable-btn'
                                        }
                                        onClick={() => onChangeStatus(team)}
                                    >
                                        {team.status === COMPANY_TEAM_STATUSES.ACTIVE ? (
                                            <>
                                                إيقاف
                                            </>
                                        ) : (
                                            <>
                                                تفعيل
                                            </>
                                        )}
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default CompanyTeamsTable;