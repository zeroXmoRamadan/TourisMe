// Central registry of all service categories on the platform.
// Services can be enabled/disabled independently. Adding a new service
// requires only adding an entry here and creating its route/page.

export const SERVICE_TYPES = {
    TOUR_PACKAGES: 'tour_packages',
    RESTAURANTS: 'restaurants',
    TRANSPORTATION: 'transportation',
};

export const servicesConfig = [
    {
        type: SERVICE_TYPES.TOUR_PACKAGES,
        label: 'Tour Packages',
        icon: 'Plane',
        route: '/tours',
        enabled: true,
        description: 'Pre-made trip programs from top tourism companies with exclusive discounts',
    },
    {
        type: SERVICE_TYPES.RESTAURANTS,
        label: 'Restaurants',
        icon: 'UtensilsCrossed',
        route: '/restaurants',
        enabled: false,
        description: 'Discover the best dining experiences in Luxor',
    },
    {
        type: SERVICE_TYPES.TRANSPORTATION,
        label: 'Transportation',
        icon: 'Car',
        route: '/transportation',
        enabled: false,
        description: 'Reliable transportation options for your Luxor visit',
    },
];

export const getEnabledServices = () => servicesConfig.filter(s => s.enabled);
export const getServiceByType = (type) => servicesConfig.find(s => s.type === type);
