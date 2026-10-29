@echo off
cd src\pages

:: Public
echo export default function LandingPage(){return <div>Landing</div>} > public\LandingPage.jsx
echo export default function LoginPage(){return <div>Login</div>} > public\LoginPage.jsx
echo export default function GuidePage(){return <div>Guide</div>} > public\GuidePage.jsx
echo export default function WeatherPage(){return <div>Meteo</div>} > public\WeatherPage.jsx
echo export default function EmergencyNumbers(){return <div>Urgence</div>} > public\EmergencyNumbers.jsx
echo export default function AboutPage(){return <div>A propos</div>} > public\AboutPage.jsx
echo export default function FaqPage(){return <div>FAQ</div>} > public\FaqPage.jsx
echo export default function PublicMapPage(){return <div>Carte publique</div>} > public\PublicMapPage.jsx
echo export default function PublicStats(){return <div>Stats</div>} > public\PublicStats.jsx

:: Citizen
echo export default function DashboardPage(){return <div>Dashboard</div>} > citizen\DashboardPage.jsx
echo export default function MapPage(){return <div>Map</div>} > citizen\MapPage.jsx
echo export default function EmergencyPage(){return <div>Emergency</div>} > citizen\EmergencyPage.jsx
echo export default function ProfilePage(){return <div>Profile</div>} > citizen\ProfilePage.jsx
echo export default function ReportPage(){return <div>Report</div>} > citizen\ReportPage.jsx
echo export default function HistoryPage(){return <div>History</div>} > citizen\HistoryPage.jsx
echo export default function FindShelter(){return <div>Find</div>} > citizen\FindShelter.jsx
echo export default function UserSettings(){return <div>Settings</div>} > citizen\UserSettings.jsx

:: Agent
echo export default function AgentDashboard(){return <div>Agent</div>} > agent\AgentDashboard.jsx
echo export default function AgentPeople(){return <div>People</div>} > agent\AgentPeople.jsx
echo export default function AgentRegister(){return <div>Register</div>} > agent\AgentRegister.jsx
echo export default function AgentSettings(){return <div>Settings</div>} > agent\AgentSettings.jsx

:: Admin
echo export default function AdminDashboard(){return <div>Admin</div>} > admin\AdminDashboard.jsx
echo export default function AdminShelters(){return <div>Shelters</div>} > admin\AdminShelters.jsx
echo export default function AdminRoads(){return <div>Roads</div>} > admin\AdminRoads.jsx
echo export default function AdminAlerts(){return <div>Alerts</div>} > admin\AdminAlerts.jsx
echo export default function AdminDangers(){return <div>Dangers</div>} > admin\AdminDangers.jsx
echo export default function AdminReports(){return <div>Reports</div>} > admin\AdminReports.jsx
echo export default function AdminUsers(){return <div>Users</div>} > admin\AdminUsers.jsx
echo export default function AdminStats(){return <div>Stats</div>} > admin\AdminStats.jsx
echo export default function AdminSettings(){return <div>Settings</div>} > admin\AdminSettings.jsx

echo Pages creees !