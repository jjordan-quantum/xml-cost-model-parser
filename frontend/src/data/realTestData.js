export const data = {
    data1: `Copying system trust bundle
Waiting for port :6443 to be released.
I0223 20:04:25.084507       1 loader.go:379] Config loaded from file:  /etc/kubernetes/static-pod-resources/configmaps/kube-apiserver-cert-syncer-kubeconfig/kubeconfig
Copying termination logs to "/var/log/kube-apiserver/termination.log"
I0223 20:04:25.087543       1 main.go:124] Touching termination lock file "/var/log/kube-apiserver/.terminating"
I0223 20:04:25.088797       1 main.go:182] Launching sub-process "/usr/bin/hyperkube kube-apiserver --openshift-config=/etc/kubernetes/static-pod-resources/configmaps/config/config.yaml --advertise-address=10.0.171.12 -v=2 --permit-address-sharing"
Flag --openshift-config has been deprecated, to be removed
I0223 20:04:25.238681      17 plugins.go:84] Registered admission plugin "authorization.openshift.io/RestrictSubjectBindings"
I0223 20:04:25.238763      17 plugins.go:84] Registered admission plugin "image.openshift.io/ImagePolicy"
I0223 20:04:25.238775      17 plugins.go:84] Registered admission plugin "route.openshift.io/IngressAdmission"
I0223 20:04:25.238783      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/OriginPodNodeEnvironment"
I0223 20:04:25.238792      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/ClusterResourceOverride"
I0223 20:04:25.238801      17 plugins.go:84] Registered admission plugin "quota.openshift.io/ClusterResourceQuota"
I0223 20:04:25.238810      17 plugins.go:84] Registered admission plugin "autoscaling.openshift.io/RunOnceDuration"
I0223 20:04:25.238819      17 plugins.go:84] Registered admission plugin "scheduling.openshift.io/PodNodeConstraints"
I0223 20:04:25.238829      17 plugins.go:84] Registered admission plugin "security.openshift.io/SecurityContextConstraint"
I0223 20:04:25.238838      17 plugins.go:84] Registered admission plugin "security.openshift.io/SCCExecRestrictions"
I0223 20:04:25.238846      17 plugins.go:84] Registered admission plugin "network.openshift.io/ExternalIPRanger"
I0223 20:04:25.238856      17 plugins.go:84] Registered admission plugin "network.openshift.io/RestrictedEndpointsAdmission"
I0223 20:04:25.238873      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateAPIServer"
I0223 20:04:25.238883      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateAuthentication"
I0223 20:04:25.238892      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateFeatureGate"
I0223 20:04:25.238952      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateConsole"
I0223 20:04:25.238966      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateImage"
I0223 20:04:25.238975      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateOAuth"
I0223 20:04:25.238991      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateProject"
I0223 20:04:25.239003      17 plugins.go:84] Registered admission plugin "config.openshift.io/DenyDeleteClusterConfiguration"
I0223 20:04:25.239014      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateScheduler"
I0223 20:04:25.239025      17 plugins.go:84] Registered admission plugin "quota.openshift.io/ValidateClusterResourceQuota"
I0223 20:04:25.239035      17 plugins.go:84] Registered admission plugin "security.openshift.io/ValidateSecurityContextConstraints"
I0223 20:04:25.239046      17 plugins.go:84] Registered admission plugin "authorization.openshift.io/ValidateRoleBindingRestriction"
I0223 20:04:25.239056      17 plugins.go:84] Registered admission plugin "config.openshift.io/ValidateNetwork"
I0223 20:04:25.239065      17 plugins.go:84] Registered admission plugin "security.openshift.io/DefaultSecurityContextConstraints"
I0223 20:04:25.243294      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true]}
I0223 20:04:25.243381      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true RotateKubeletServerCertificate:true]}
W0223 20:04:25.243488      17 feature_gate.go:236] Setting GA feature gate SupportPodPidsLimit=true. It will be removed in a future release.
I0223 20:04:25.243540      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true RotateKubeletServerCertificate:true SupportPodPidsLimit:true]}
I0223 20:04:25.243629      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true NodeDisruptionExclusion:true RotateKubeletServerCertificate:true SupportPodPidsLimit:true]}
I0223 20:04:25.243709      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true NodeDisruptionExclusion:true RotateKubeletServerCertificate:true ServiceNodeExclusion:true SupportPodPidsLimit:true]}
W0223 20:04:25.243803      17 feature_gate.go:236] Setting GA feature gate SCTPSupport=true. It will be removed in a future release.
I0223 20:04:25.243846      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true NodeDisruptionExclusion:true RotateKubeletServerCertificate:true SCTPSupport:true ServiceNodeExclusion:true SupportPodPidsLimit:true]}
I0223 20:04:25.243962      17 feature_gate.go:244] feature gates: &{map[APIPriorityAndFairness:true LegacyNodeRoleBehavior:false NodeDisruptionExclusion:true RotateKubeletServerCertificate:true SCTPSupport:true ServiceNodeExclusion:true SupportPodPidsLimit:true]}
Flag --openshift-config has been deprecated, to be removed
Flag --enable-logs-handler has been deprecated, This flag will be removed in v1.19
Flag --enable-swagger-ui has been deprecated, swagger 1.2 support has been removed
Flag --insecure-port has been deprecated, This flag has no effect now and will be removed in v1.24.
Flag --kubelet-https has been deprecated, API Server connections to kubelets always use https. This flag will be removed in 1.22.
Flag --kubelet-read-only-port has been deprecated, kubelet-read-only-port is deprecated and will be removed.
I0223 20:04:25.244167      17 flags.go:59] FLAG: --add-dir-header="false"
I0223 20:04:25.244184      17 flags.go:59] FLAG: --address="127.0.0.1"
I0223 20:04:25.244196      17 flags.go:59] FLAG: --admission-control="[]"
I0223 20:04:25.244213      17 flags.go:59] FLAG: --admission-control-config-file="/tmp/kubeapiserver-admission-config.yaml487454417"
I0223 20:04:25.244224      17 flags.go:59] FLAG: --advertise-address="10.0.171.12"
I0223 20:04:25.244234      17 flags.go:59] FLAG: --allow-privileged="true"
I0223 20:04:25.244251      17 flags.go:59] FLAG: --alsologtostderr="false"
I0223 20:04:25.244261      17 flags.go:59] FLAG: --anonymous-auth="true"
I0223 20:04:25.244302      17 flags.go:59] FLAG: --api-audiences="[https://kubernetes.default.svc]"
I0223 20:04:25.244317      17 flags.go:59] FLAG: --apiserver-count="1"
I0223 20:04:25.244327      17 flags.go:59] FLAG: --audit-log-batch-buffer-size="10000"
I0223 20:04:25.244336      17 flags.go:59] FLAG: --audit-log-batch-max-size="1"
I0223 20:04:25.244343      17 flags.go:59] FLAG: --audit-log-batch-max-wait="0s"
I0223 20:04:25.244354      17 flags.go:59] FLAG: --audit-log-batch-throttle-burst="0"
I0223 20:04:25.244362      17 flags.go:59] FLAG: --audit-log-batch-throttle-enable="false"
I0223 20:04:25.244371      17 flags.go:59] FLAG: --audit-log-batch-throttle-qps="0"
I0223 20:04:25.244382      17 flags.go:59] FLAG: --audit-log-compress="false"
I0223 20:04:25.244390      17 flags.go:59] FLAG: --audit-log-format="json"
I0223 20:04:25.244398      17 flags.go:59] FLAG: --audit-log-maxage="0"
I0223 20:04:25.244407      17 flags.go:59] FLAG: --audit-log-maxbackup="10"
I0223 20:04:25.244414      17 flags.go:59] FLAG: --audit-log-maxsize="100"
I0223 20:04:25.244423      17 flags.go:59] FLAG: --audit-log-mode="blocking"
I0223 20:04:25.244430      17 flags.go:59] FLAG: --audit-log-path="/var/log/kube-apiserver/audit.log"
I0223 20:04:25.244438      17 flags.go:59] FLAG: --audit-log-truncate-enabled="false"
I0223 20:04:25.244445      17 flags.go:59] FLAG: --audit-log-truncate-max-batch-size="10485760"
I0223 20:04:25.244458      17 flags.go:59] FLAG: --audit-log-truncate-max-event-size="102400"
I0223 20:04:25.244466      17 flags.go:59] FLAG: --audit-log-version="audit.k8s.io/v1"
I0223 20:04:25.244475      17 flags.go:59] FLAG: --audit-policy-file="/etc/kubernetes/static-pod-resources/configmaps/kube-apiserver-audit-policies/default.yaml"
I0223 20:04:25.244490      17 flags.go:59] FLAG: --audit-webhook-batch-buffer-size="10000"
I0223 20:04:25.244499      17 flags.go:59] FLAG: --audit-webhook-batch-initial-backoff="10s"
I0223 20:04:25.244509      17 flags.go:59] FLAG: --audit-webhook-batch-max-size="400"
I0223 20:04:25.244518      17 flags.go:59] FLAG: --audit-webhook-batch-max-wait="30s"
I0223 20:04:25.244526      17 flags.go:59] FLAG: --audit-webhook-batch-throttle-burst="15"
I0223 20:04:25.244533      17 flags.go:59] FLAG: --audit-webhook-batch-throttle-enable="true"`,
    data2: `ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.strategy.properties.rollingUpdate.properties.maxUnavailable has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.env.items.<array>.properties.valueFrom.properties.resourceFieldRef.properties.divisor has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.lifecycle.properties.postStart.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.lifecycle.properties.postStart.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.lifecycle.properties.preStop.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.lifecycle.properties.preStop.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.livenessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.livenessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.readinessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.readinessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.resources.properties.limits.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.resources.properties.requests.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.startupProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.containers.items.<array>.properties.startupProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.env.items.<array>.properties.valueFrom.properties.resourceFieldRef.properties.divisor has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.lifecycle.properties.postStart.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.lifecycle.properties.postStart.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.lifecycle.properties.preStop.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.lifecycle.properties.preStop.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.livenessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.livenessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.readinessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.readinessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.resources.properties.limits.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.resources.properties.requests.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.startupProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.ephemeralContainers.items.<array>.properties.startupProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.env.items.<array>.properties.valueFrom.properties.resourceFieldRef.properties.divisor has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.lifecycle.properties.postStart.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.lifecycle.properties.postStart.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.lifecycle.properties.preStop.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.lifecycle.properties.preStop.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.livenessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.livenessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.readinessProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.readinessProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.resources.properties.limits.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.resources.properties.requests.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.startupProbe.properties.httpGet.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.initContainers.items.<array>.properties.startupProbe.properties.tcpSocket.properties.port has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.overhead.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.volumes.items.<array>.properties.downwardAPI.properties.items.items.<array>.properties.resourceFieldRef.properties.divisor has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.volumes.items.<array>.properties.emptyDir.properties.sizeLimit has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.volumes.items.<array>.properties.ephemeral.properties.volumeClaimTemplate.properties.spec.properties.resources.properties.limits.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.volumes.items.<array>.properties.ephemeral.properties.volumeClaimTemplate.properties.spec.properties.resources.properties.requests.additionalProperties.schema has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.install.properties.spec.properties.deployments.items.<array>.properties.spec.properties.template.properties.spec.properties.volumes.items.<array>.properties.projected.properties.sources.items.<array>.properties.downwardAPI.properties.items.items.<array>.properties.resourceFieldRef.properties.divisor has invalid property: anyOf
ERROR $root.definitions.com.coreos.operators.v1alpha1.ClusterServiceVersion.properties.spec.properties.webhookdefinitions.items.<array>.properties.targetPort has invalid property: anyOf
I0223 20:05:07.667701      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:07.667752      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:07.678136      17 store.go:1376] Monitoring clusterserviceversions.operators.coreos.com count at <storage-prefix>//operators.coreos.com/clusterserviceversions
I0223 20:05:07.691254      17 aggregator.go:231] Updating OpenAPI spec because v1beta1.metrics.k8s.io is updated
I0223 20:05:08.674654      17 trace.go:205] Trace[1868691782]: "List etcd3" key:/operators.coreos.com/clusterserviceversions,resourceVersion:,resourceVersionMatch:,limit:10000,continue: (23-Feb-2021 20:05:07.679) (total time: 995ms):
Trace[1868691782]: [995.4145ms] [995.4145ms] END
I0223 20:05:08.676188      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:08.679737      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.679784      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.698161      17 store.go:1376] Monitoring revisions.serving.knative.dev count at <storage-prefix>//serving.knative.dev/revisions
I0223 20:05:08.724867      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:08.754671      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.754723      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.767631      17 store.go:1376] Monitoring subscriptions.messaging.knative.dev count at <storage-prefix>//messaging.knative.dev/subscriptions
I0223 20:05:08.769534      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.769574      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.789584      17 store.go:1376] Monitoring subscriptions.messaging.knative.dev count at <storage-prefix>//messaging.knative.dev/subscriptions
I0223 20:05:08.810383      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:08.870012      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.870070      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.884241      17 store.go:1376] Monitoring sinkbindings.sources.knative.dev count at <storage-prefix>//sources.knative.dev/sinkbindings
I0223 20:05:08.888348      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.888560      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.893263      17 trace.go:205] Trace[779616982]: "Call conversion webhook" custom-resource-definition:subscriptions.messaging.knative.dev,desired-api-version:messaging.knative.dev/v1beta1,object-count:1,UID:dc30bc31-0391-49ed-8c76-86daaa780e14 (23-Feb-2021 20:05:08.794) (total time: 98ms):
Trace[779616982]: ---"Request completed" 98ms (20:05:00.892)
Trace[779616982]: [98.488399ms] [98.488399ms] END
I0223 20:05:08.906377      17 store.go:1376] Monitoring sinkbindings.sources.knative.dev count at <storage-prefix>//sources.knative.dev/sinkbindings
I0223 20:05:08.908020      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.908056      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.930733      17 store.go:1376] Monitoring sinkbindings.sources.knative.dev count at <storage-prefix>//sources.knative.dev/sinkbindings
I0223 20:05:08.932408      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:08.932459      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:08.942661      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:08.946867      17 store.go:1376] Monitoring sinkbindings.sources.knative.dev count at <storage-prefix>//sources.knative.dev/sinkbindings
I0223 20:05:08.976732      17 trace.go:205] Trace[417800427]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1alpha1,object-count:1,UID:4b5243e4-7878-436f-be04-be717cb0f5d2 (23-Feb-2021 20:05:08.902) (total time: 74ms):
Trace[417800427]: ---"Request completed" 74ms (20:05:00.976)
Trace[417800427]: [74.13198ms] [74.13198ms] END
I0223 20:05:08.985668      17 trace.go:205] Trace[154168225]: "Call conversion webhook" custom-resource-definition:subscriptions.messaging.knative.dev,desired-api-version:messaging.knative.dev/v1beta1,object-count:1,UID:ae629e81-0e7d-48f1-acd0-a10d6cfbf71d (23-Feb-2021 20:05:08.894) (total time: 91ms):
Trace[154168225]: ---"Request completed" 91ms (20:05:00.985)
Trace[154168225]: [91.438968ms] [91.438968ms] END
I0223 20:05:08.994436      17 trace.go:205] Trace[584246906]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1alpha2,object-count:1,UID:113685ab-0a01-4a89-a631-7df924e2a234 (23-Feb-2021 20:05:08.914) (total time: 79ms):
Trace[584246906]: ---"Request completed" 79ms (20:05:00.994)
Trace[584246906]: [79.431148ms] [79.431148ms] END
I0223 20:05:09.018345      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:09.018401      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:09.031128      17 store.go:1376] Monitoring triggers.eventing.knative.dev count at <storage-prefix>//eventing.knative.dev/triggers
I0223 20:05:09.032798      17 client.go:360] parsed scheme: "endpoint"
I0223 20:05:09.032846      17 endpoint.go:68] ccResolverWrapper: sending new addresses to cc: [{https://10.0.137.156:2379  <nil> 0 <nil>} {https://10.0.158.175:2379  <nil> 0 <nil>} {https://10.0.171.12:2379  <nil> 0 <nil>} {https://localhost:2379  <nil> 0 <nil>}]
I0223 20:05:09.051739      17 store.go:1376] Monitoring triggers.eventing.knative.dev count at <storage-prefix>//eventing.knative.dev/triggers
I0223 20:05:09.061374      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:09.077620      17 trace.go:205] Trace[522766072]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1alpha2,object-count:1,UID:3f02b86e-279b-48f8-86c5-1f991d16c2bf (23-Feb-2021 20:05:08.995) (total time: 82ms):
Trace[522766072]: ---"Request completed" 82ms (20:05:00.077)
Trace[522766072]: [82.519697ms] [82.519697ms] END
I0223 20:05:09.079213      17 trace.go:205] Trace[1177843340]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1alpha1,object-count:1,UID:03355f47-7e36-4c38-8fac-5d88274d53f2 (23-Feb-2021 20:05:08.993) (total time: 85ms):
Trace[1177843340]: ---"Request completed" 85ms (20:05:00.079)
Trace[1177843340]: [85.564957ms] [85.564957ms] END
I0223 20:05:09.079479      17 trace.go:205] Trace[1358236459]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1,object-count:1,UID:014eb05c-1142-4ab5-9afb-821a9c656d20 (23-Feb-2021 20:05:08.993) (total time: 85ms):
Trace[1358236459]: ---"Request completed" 85ms (20:05:00.079)
Trace[1358236459]: [85.687911ms] [85.687911ms] END
I0223 20:05:09.080737      17 trace.go:205] Trace[1389066300]: "Call conversion webhook" custom-resource-definition:subscriptions.messaging.knative.dev,desired-api-version:messaging.knative.dev/v1beta1,object-count:1,UID:b21ca313-1b4a-4860-ab13-c36b8ee2d75c (23-Feb-2021 20:05:08.986) (total time: 94ms):
Trace[1389066300]: ---"Request completed" 94ms (20:05:00.080)
Trace[1389066300]: [94.341421ms] [94.341421ms] END
I0223 20:05:09.088080      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:09.176930      17 trace.go:205] Trace[499287539]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1,object-count:1,UID:d5cf8bb5-5d16-4497-8097-5809bd169e69 (23-Feb-2021 20:05:09.088) (total time: 87ms):
Trace[499287539]: ---"Request completed" 87ms (20:05:00.176)
Trace[499287539]: [87.977259ms] [87.977259ms] END
I0223 20:05:09.178693      17 trace.go:205] Trace[632851168]: "Call conversion webhook" custom-resource-definition:triggers.eventing.knative.dev,desired-api-version:eventing.knative.dev/v1beta1,object-count:1,UID:ecd63ff4-facd-4a3c-b782-751b20615f5b (23-Feb-2021 20:05:09.085) (total time: 93ms):
Trace[632851168]: ---"Request completed" 92ms (20:05:00.178)
Trace[632851168]: [93.051535ms] [93.051535ms] END
I0223 20:05:09.179793      17 trace.go:205] Trace[2084183409]: "Call conversion webhook" custom-resource-definition:subscriptions.messaging.knative.dev,desired-api-version:messaging.knative.dev/v1beta1,object-count:1,UID:d5ed3cee-18f2-4dd4-837e-46b164169981 (23-Feb-2021 20:05:09.087) (total time: 92ms):
Trace[2084183409]: ---"Request completed" 92ms (20:05:00.179)
Trace[2084183409]: [92.490416ms] [92.490416ms] END
I0223 20:05:09.182656      17 cacher.go:405] cacher (*unstructured.Unstructured): initialized
I0223 20:05:09.183483      17 trace.go:205] Trace[240293913]: "Call conversion webhook" custom-resource-definition:sinkbindings.sources.knative.dev,desired-api-version:sources.knative.dev/v1alpha2,object-count:1,UID:78ee597e-16c1-4a1c-98f2-c73004704dfa (23-Feb-2021 20:05:09.088) (total time: 95ms):
Trace[240293913]: ---"Request completed" 95ms (20:05:00.183)
Trace[240293913]: [95.411733ms] [95.411733ms] END`,
    data3: `I0223 20:39:09.342678      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:09.342725      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.158.175:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:09.342741      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:09.342948      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02b047080, {CONNECTING <nil>}
I0223 20:39:09.355135      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02b047080, {READY <nil>}
I0223 20:39:09.356758      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:09.905720      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:09.905783      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.137.156:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:09.905801      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:09.905898      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc01d3d8c00, {CONNECTING <nil>}
I0223 20:39:09.921266      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc01d3d8c00, {READY <nil>}
I0223 20:39:09.924744      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:17.533766      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:17.533829      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.171.12:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:17.533848      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:17.534106      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc0126046c0, {CONNECTING <nil>}
I0223 20:39:17.543548      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc0126046c0, {READY <nil>}
I0223 20:39:17.544838      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:18.558397      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:18.558470      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://localhost:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:18.558488      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:18.558854      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc020159ca0, {CONNECTING <nil>}
I0223 20:39:18.570488      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc020159ca0, {READY <nil>}
I0223 20:39:18.571686      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
E0223 20:39:33.145599      17 controller.go:116] loading OpenAPI spec for "v1.admission.work.open-cluster-management.io" failed with: OpenAPI spec does not exist
I0223 20:39:33.145632      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.work.open-cluster-management.io: Rate Limited Requeue.
E0223 20:39:33.178176      17 controller.go:116] loading OpenAPI spec for "v1beta1.webhook.certmanager.k8s.io" failed with: OpenAPI spec does not exist
I0223 20:39:33.178219      17 controller.go:129] OpenAPI AggregationController: action for item v1beta1.webhook.certmanager.k8s.io: Rate Limited Requeue.
E0223 20:39:33.196678      17 controller.go:116] loading OpenAPI spec for "v1.admission.hive.openshift.io" failed with: OpenAPI spec does not exist
I0223 20:39:33.196719      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.hive.openshift.io: Rate Limited Requeue.
E0223 20:39:33.215606      17 controller.go:116] loading OpenAPI spec for "v1.admission.cluster.open-cluster-management.io" failed with: OpenAPI spec does not exist
I0223 20:39:33.215640      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.cluster.open-cluster-management.io: Rate Limited Requeue.
I0223 20:39:33.815455      17 cacher.go:782] cacher (*core.Pod): 1 objects queued in incoming channel.
I0223 20:39:33.815486      17 cacher.go:782] cacher (*core.Pod): 2 objects queued in incoming channel.
E0223 20:39:50.321232      17 writers.go:107] apiserver was unable to write a JSON response: http: Handler timeout
E0223 20:39:50.321441      17 status.go:71] apiserver received an error that is not an metav1.Status: &errors.errorString{s:"http: Handler timeout"}
E0223 20:39:50.322557      17 writers.go:120] apiserver was unable to write a fallback JSON response: http: Handler timeout
I0223 20:39:52.263464      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:52.263552      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.171.12:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:52.263567      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:52.263655      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02c6afc90, {CONNECTING <nil>}
I0223 20:39:52.274876      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02c6afc90, {READY <nil>}
I0223 20:39:52.275771      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:52.578122      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:52.578176      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.158.175:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:52.578193      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:52.578497      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02cf76750, {CONNECTING <nil>}
I0223 20:39:52.591004      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02cf76750, {READY <nil>}
I0223 20:39:52.592632      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:54.756286      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:54.756333      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.137.156:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:54.756344      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:54.756414      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc023625960, {CONNECTING <nil>}
I0223 20:39:54.767808      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc023625960, {READY <nil>}
I0223 20:39:54.769129      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:39:56.404294      17 client.go:360] parsed scheme: "passthrough"
I0223 20:39:56.404345      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://localhost:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:39:56.404361      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:39:56.404481      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc021f4dcb0, {CONNECTING <nil>}
I0223 20:39:56.415138      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc021f4dcb0, {READY <nil>}
I0223 20:39:56.416213      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
E0223 20:40:02.220022      17 writers.go:107] apiserver was unable to write a JSON response: http: Handler timeout
E0223 20:40:02.220127      17 status.go:71] apiserver received an error that is not an metav1.Status: &errors.errorString{s:"http: Handler timeout"}
E0223 20:40:02.221866      17 writers.go:120] apiserver was unable to write a fallback JSON response: http: Handler timeout
I0223 20:40:25.339731      17 client.go:360] parsed scheme: "passthrough"
I0223 20:40:25.339789      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.158.175:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:40:25.339807      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:40:25.340129      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc015a709b0, {CONNECTING <nil>}
I0223 20:40:25.353181      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc015a709b0, {READY <nil>}
I0223 20:40:25.354655      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:40:30.462091      17 client.go:360] parsed scheme: "passthrough"
I0223 20:40:30.462135      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.171.12:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:40:30.462146      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:40:30.462230      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc016332960, {CONNECTING <nil>}
I0223 20:40:30.472773      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc016332960, {READY <nil>}
I0223 20:40:30.474206      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
E0223 20:40:31.243026      17 writers.go:107] apiserver was unable to write a JSON response: http: Handler timeout
E0223 20:40:31.243150      17 status.go:71] apiserver received an error that is not an metav1.Status: &errors.errorString{s:"http: Handler timeout"}
E0223 20:40:31.244166      17 writers.go:120] apiserver was unable to write a fallback JSON response: http: Handler timeout
E0223 20:40:33.150787      17 controller.go:116] loading OpenAPI spec for "v1.admission.work.open-cluster-management.io" failed with: OpenAPI spec does not exist
I0223 20:40:33.150819      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.work.open-cluster-management.io: Rate Limited Requeue.
E0223 20:40:33.190190      17 controller.go:116] loading OpenAPI spec for "v1beta1.webhook.certmanager.k8s.io" failed with: OpenAPI spec does not exist
I0223 20:40:33.190224      17 controller.go:129] OpenAPI AggregationController: action for item v1beta1.webhook.certmanager.k8s.io: Rate Limited Requeue.
E0223 20:40:33.201566      17 controller.go:116] loading OpenAPI spec for "v1.admission.hive.openshift.io" failed with: OpenAPI spec does not exist
I0223 20:40:33.201592      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.hive.openshift.io: Rate Limited Requeue.
E0223 20:40:33.221136      17 controller.go:116] loading OpenAPI spec for "v1.admission.cluster.open-cluster-management.io" failed with: OpenAPI spec does not exist
I0223 20:40:33.221163      17 controller.go:129] OpenAPI AggregationController: action for item v1.admission.cluster.open-cluster-management.io: Rate Limited Requeue.
I0223 20:40:36.603974      17 client.go:360] parsed scheme: "passthrough"
I0223 20:40:36.604027      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://localhost:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:40:36.604042      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:40:36.604223      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02aa90b70, {CONNECTING <nil>}
I0223 20:40:36.613458      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc02aa90b70, {READY <nil>}
I0223 20:40:36.614529      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
I0223 20:40:37.663227      17 client.go:360] parsed scheme: "passthrough"
I0223 20:40:37.663281      17 passthrough.go:48] ccResolverWrapper: sending update to cc: {[{https://10.0.137.156:2379  <nil> 0 <nil>}] <nil> <nil>}
I0223 20:40:37.663296      17 clientconn.go:948] ClientConn switching balancer to "pick_first"
I0223 20:40:37.663389      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc015fa35a0, {CONNECTING <nil>}
I0223 20:40:37.676172      17 balancer_conn_wrappers.go:78] pickfirstBalancer: HandleSubConnStateChange: 0xc015fa35a0, {READY <nil>}
I0223 20:40:37.677917      17 controlbuf.go:508] transport: loopyWriter.run returning. connection error: desc = "transport is closing"
E0223 20:40:40.123848      17 writers.go:64] error encountered while streaming results via websocket: context canceled
I0223 20:40:40.123959      17 trace.go:205] Trace[1418061176]: "Get" url:/api/v1/namespaces/openshift-kube-apiserver/pods/kube-apiserver-ip-10-0-171-12.ec2.internal/log,user-agent:Mozilla/5.0 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36,client:76.182.85.204 (23-Feb-2021 20:13:49.846) (total time: 1610277ms):
Trace[1418061176]: ---"Transformed response object" 1610268ms (20:40:00.123)
Trace[1418061176]: [26m50.277491693s] [26m50.277491693s] END`,
}