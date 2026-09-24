from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from django.utils import timezone
from datetime import timedelta, datetime
from rest_framework.permissions import IsAuthenticated
from .models import Package, Truck, RouteAssignment, DeliveryHistory
from .permissions import IsManager, get_user_company
from authentication.models import User
import logging

logger = logging.getLogger(__name__)


class StatisticsView(APIView):
    """
    Get comprehensive statistics for the dashboard
    """
    permission_classes = [IsAuthenticated, IsManager]

    def get(self, request):
        try:
            # Everything is scoped to the manager's company. "pending" uses the
            # same definition as packages/today-pending (the client subtracts one
            # from the other).
            company = get_user_company(request.user)
            packages = Package.objects.for_company(company)
            trucks_qs = Truck.objects.for_company(company)
            routes = RouteAssignment.objects.for_company(company)
            drivers = User.objects.filter(company=company, isManager=False) if company else User.objects.none()
            # Initialize default values
            package_stats = {
                'total_packages': 0,
                'pending_packages': 0,
                'in_transit_packages': 0,
                'delivered_packages': 0,
                'undelivered_packages': 0
            }
            
            truck_stats = {
                'total_trucks': 0,
                'used_trucks': 0,
                'available_trucks': 0
            }
            
            truck_usage_data = []
            daily_deliveries = []
            recent_activity = []
            
            # Try to get package stats
            try:
                package_stats = packages.aggregate(
                    total_packages=Count('id'),
                    pending_packages=Count('id', filter=Q(pk__in=Package.objects.pending_for_company(company).values('pk'))),
                    in_transit_packages=Count('id', filter=Q(status='in_transit')),
                    delivered_packages=Count('id', filter=Q(status='delivered')),
                    undelivered_packages=Count('id', filter=Q(status='undelivered'))
                )
            except Exception:
                logger.exception("Error getting package stats")
            
            # Try to get truck stats
            try:
                truck_stats = trucks_qs.aggregate(
                    total_trucks=Count('id'),
                    used_trucks=Count('id', filter=Q(isUsed=True)),
                    available_trucks=Count('id', filter=Q(isUsed=False))
                )
            except Exception:
                logger.exception("Error getting truck stats")

            # Try to get truck usage details
            try:
                trucks = trucks_qs
                for truck in trucks:
                    try:
                        active_routes = routes.filter(
                            truck=truck,
                            isActive=True
                        )
                        
                        total_packages = 0
                        for route in active_routes:
                            if route.packageSequence:
                                total_packages += len(route.packageSequence)
                        
                        truck_usage_data.append({
                            'truck': truck.licensePlate,
                            'used': total_packages,
                            'capacity': float(truck.kilogramCapacity),
                            'isUsed': truck.isUsed
                        })
                    except Exception:
                        logger.exception("Error processing truck %s", truck.licensePlate)
                        truck_usage_data.append({
                            'truck': truck.licensePlate,
                            'used': 0,
                            'capacity': float(truck.kilogramCapacity),
                            'isUsed': truck.isUsed
                        })
            except Exception:
                logger.exception("Error getting truck usage data")

            # Try to get daily deliveries
            try:
                today = timezone.localdate()
                for i in range(7):
                    date = today - timedelta(days=i)
                    day_name = date.strftime('%a')
                    
                    delivered_count = packages.filter(
                        deliveryDate=date,
                        status='delivered'
                    ).count()
                    
                    daily_deliveries.append({
                        'day': day_name,
                        'value': delivered_count,
                        'date': date.isoformat()
                    })
                
                daily_deliveries.reverse()
            except Exception:
                logger.exception("Error getting daily deliveries")
                # Provide default data
                daily_deliveries = [
                    {'day': 'Mon', 'value': 0, 'date': ''},
                    {'day': 'Tue', 'value': 0, 'date': ''},
                    {'day': 'Wed', 'value': 0, 'date': ''},
                    {'day': 'Thu', 'value': 0, 'date': ''},
                    {'day': 'Fri', 'value': 0, 'date': ''},
                    {'day': 'Sat', 'value': 0, 'date': ''},
                    {'day': 'Sun', 'value': 0, 'date': ''}
                ]

            # Try to get additional statistics
            try:
                active_routes = routes.filter(isActive=True).count()
                total_drivers = drivers.count()
                verified_drivers = drivers.filter(verified=True).count()
                unverified_drivers = total_drivers - verified_drivers
            except Exception:
                logger.exception("Error getting additional stats")
                active_routes = 0
                total_drivers = 0
                verified_drivers = 0
                unverified_drivers = 0

            # Try to get recent activity
            try:
                recent_packages = packages.order_by('-id')[:10]
                for package in recent_packages:
                    if package.status == 'delivered':
                        activity_text = f"Package delivered to {package.recipient}"
                        activity_type = "delivery"
                    elif package.status == 'in_transit':
                        activity_text = f"Package in transit to {package.recipient}"
                        activity_type = "transit"
                    elif package.status == 'pending':
                        activity_text = f"Package pending for {package.recipient}"
                        activity_type = "pending"
                    else:
                        activity_text = f"Package {package.status} for {package.recipient}"
                        activity_type = "other"
                    
                    recent_activity.append({
                        'text': activity_text,
                        'type': activity_type,
                        'time': package.deliveryDate.isoformat() if package.deliveryDate else None
                    })
            except Exception:
                logger.exception("Error getting recent activity")

            response_data = {
                'package_stats': {
                    'total': package_stats.get('total_packages', 0) or 0,
                    'pending': package_stats.get('pending_packages', 0) or 0,
                    'in_transit': package_stats.get('in_transit_packages', 0) or 0,
                    'delivered': package_stats.get('delivered_packages', 0) or 0,
                    'undelivered': package_stats.get('undelivered_packages', 0) or 0
                },
                'truck_stats': {
                    'total': truck_stats.get('total_trucks', 0) or 0,
                    'used': truck_stats.get('used_trucks', 0) or 0,
                    'available': truck_stats.get('available_trucks', 0) or 0
                },
                'truck_usage_data': truck_usage_data,
                'daily_deliveries': daily_deliveries,
                'package_status_distribution': [
                    {'name': 'Delivered', 'value': package_stats.get('delivered_packages', 0) or 0},
                    {'name': 'In Transit', 'value': package_stats.get('in_transit_packages', 0) or 0},
                    {'name': 'Pending', 'value': package_stats.get('pending_packages', 0) or 0},
                    {'name': 'Undelivered', 'value': package_stats.get('undelivered_packages', 0) or 0}
                ],
                'summary_stats': {
                    'active_routes': active_routes,
                    'total_drivers': total_drivers,
                    'verified_drivers': verified_drivers,
                    'unverified_drivers': unverified_drivers
                },
                'recent_activity': recent_activity
            }

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception:
            logger.exception("Error retrieving statistics")
            return Response(
                {"error": "Error retrieving statistics."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
